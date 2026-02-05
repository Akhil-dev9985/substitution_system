import re, zlib, pathlib
from collections import defaultdict

data = pathlib.Path('tt/teacher_tt.pdf').read_bytes()

# Build object map
objects = {}
for m in re.finditer(rb'(\d+)\s+(\d+)\s+obj(.*?)endobj', data, re.S):
    objects[(int(m.group(1)), int(m.group(2)))] = m.group(3).strip()

def get_obj(ref):
    return objects.get(ref)

# Parse CMap

def parse_cmap(cmap_bytes):
    text = cmap_bytes.decode('latin-1', errors='ignore')
    mapping = {}
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.endswith('beginbfchar'):
            try:
                count = int(line.split()[0])
            except Exception:
                count = 0
            i += 1
            for _ in range(count):
                if i >= len(lines):
                    break
                l = lines[i].strip()
                i += 1
                m = re.findall(r'<([0-9A-Fa-f]+)>', l)
                if len(m) >= 2:
                    src = int(m[0], 16)
                    dst_hex = m[1]
                    dst = bytes.fromhex(dst_hex).decode('utf-16-be', errors='ignore')
                    mapping[src] = dst
            continue
        if line.endswith('beginbfrange'):
            try:
                count = int(line.split()[0])
            except Exception:
                count = 0
            i += 1
            for _ in range(count):
                if i >= len(lines):
                    break
                l = lines[i].strip()
                i += 1
                if '[' in l:
                    m = re.findall(r'<([0-9A-Fa-f]+)>', l)
                    if len(m) >= 2:
                        start = int(m[0], 16)
                        end = int(m[1], 16)
                        arr = m[2:]
                        for j, hexv in enumerate(arr):
                            if start + j > end:
                                break
                            dst = bytes.fromhex(hexv).decode('utf-16-be', errors='ignore')
                            mapping[start + j] = dst
                    continue
                m = re.findall(r'<([0-9A-Fa-f]+)>', l)
                if len(m) >= 3:
                    start = int(m[0], 16)
                    end = int(m[1], 16)
                    dst_start = int(m[2], 16)
                    for src in range(start, end + 1):
                        dst = bytes.fromhex(f'{dst_start:04x}').decode('utf-16-be', errors='ignore')
                        mapping[src] = dst
                        dst_start += 1
            continue
        i += 1
    return mapping

# Build font object -> cmap mapping
font_to_cmap = {}
for (objnum, gen), content in objects.items():
    if b'/Type' in content and b'/Font' in content:
        m = re.search(rb'/ToUnicode\s+(\d+)\s+(\d+)\s+R', content)
        if not m:
            continue
        ref = (int(m.group(1)), int(m.group(2)))
        cmap_obj = get_obj(ref)
        if not cmap_obj:
            continue
        sm = re.search(rb'stream\r?\n(.*?)\r?\nendstream', cmap_obj, re.S)
        if not sm:
            continue
        raw = sm.group(1)
        if b'/FlateDecode' in cmap_obj:
            try:
                dec = zlib.decompress(raw)
            except Exception:
                try:
                    dec = zlib.decompress(raw, -15)
                except Exception:
                    dec = raw
        else:
            dec = raw
        font_to_cmap[(objnum, gen)] = parse_cmap(dec)

# Find catalog and pages
catalog_ref = None
for (objnum, gen), content in objects.items():
    if b'/Type' in content and b'/Catalog' in content:
        m = re.search(rb'/Pages\s+(\d+)\s+(\d+)\s+R', content)
        if m:
            catalog_ref = (int(m.group(1)), int(m.group(2)))
            break

pages = []

def walk_pages(ref):
    obj = get_obj(ref)
    if not obj:
        return
    if re.search(rb'/Type\s*/Page\b', obj):
        pages.append(ref)
        return
    kids_m = re.search(rb'/Kids\s*\[(.*?)\]', obj, re.S)
    if not kids_m:
        return
    kids = re.findall(rb'(\d+)\s+(\d+)\s+R', kids_m.group(1))
    for k in kids:
        walk_pages((int(k[0]), int(k[1])))

if catalog_ref:
    walk_pages(catalog_ref)

# Extract font resources per page
page_font_maps = []
for pref in pages:
    pobj = get_obj(pref)
    if not pobj:
        page_font_maps.append({})
        continue
    res_ref = re.search(rb'/Resources\s+(\d+)\s+(\d+)\s+R', pobj)
    if res_ref:
        res_obj = get_obj((int(res_ref.group(1)), int(res_ref.group(2))))
    else:
        res_obj = pobj
    font_map = {}
    if res_obj:
        font_m = re.search(rb'/Font\s*<<(.+?)>>', res_obj, re.S)
        if font_m:
            entries = re.findall(rb'/([A-Za-z0-9]+)\s+(\d+)\s+(\d+)\s+R', font_m.group(1))
            for name,a,b in entries:
                cmap = font_to_cmap.get((int(a), int(b)))
                if cmap:
                    font_map[name.decode('latin-1')] = cmap
    page_font_maps.append(font_map)

# Content streams per page
page_contents = []
for pref in pages:
    pobj = get_obj(pref)
    if not pobj:
        page_contents.append([])
        continue
    cont_m = re.search(rb'/Contents\s+((\d+)\s+(\d+)\s+R|\[(.*?)\])', pobj, re.S)
    streams = []
    if cont_m:
        if cont_m.group(2):
            streams = [(int(cont_m.group(2)), int(cont_m.group(3)))]
        else:
            arr = cont_m.group(4)
            refs = re.findall(rb'(\d+)\s+(\d+)\s+R', arr)
            streams = [(int(a), int(b)) for a,b in refs]
    page_contents.append(streams)

# Tokenizer helpers
WHITESPACE = b' \t\r\n\x0c\x00'
DELIMS = b'()<>[]{}/%'

def parse_literal_string(data, start):
    i = start + 1
    depth = 1
    out = bytearray()
    n = len(data)
    while i < n and depth > 0:
        ch = data[i:i+1]
        if ch == b'\\':
            i += 1
            if i >= n:
                break
            esc = data[i:i+1]
            if esc in b'nrtbf':
                out += {b'n': b'\n', b'r': b'\r', b't': b'\t', b'b': b'\b', b'f': b'\f'}[esc]
            elif esc in b'()\\':
                out += esc
            elif esc >= b'0' and esc <= b'7':
                oct_digits = esc
                for _ in range(2):
                    if i + 1 < n and data[i+1:i+2] >= b'0' and data[i+1:i+2] <= b'7':
                        i += 1
                        oct_digits += data[i:i+1]
                    else:
                        break
                out += bytes([int(oct_digits, 8)])
            else:
                out += esc
        elif ch == b'(':
            depth += 1
            out += ch
        elif ch == b')':
            depth -= 1
            if depth > 0:
                out += ch
        else:
            out += ch
        i += 1
    return bytes(out), i


def read_number(data, i):
    m = re.match(rb'[+-]?(?:\d*\.\d+|\d+)', data[i:])
    if not m:
        return None, i
    s = m.group(0)
    if b'.' in s:
        return float(s), i + len(s)
    return int(s), i + len(s)


def tokenize(data):
    i = 0
    n = len(data)
    while i < n:
        c = data[i:i+1]
        if c in WHITESPACE:
            i += 1
            continue
        if c == b'%':
            j = data.find(b'\n', i)
            if j == -1:
                break
            i = j + 1
            continue
        if c == b'/':
            j = i + 1
            while j < n and data[j:j+1] not in WHITESPACE and data[j:j+1] not in DELIMS:
                j += 1
            yield ('name', data[i+1:j].decode('latin-1'))
            i = j
            continue
        if c == b'(':
            s, j = parse_literal_string(data, i)
            yield ('string', s)
            i = j
            continue
        if c == b'[':
            arr = []
            i += 1
            while i < n:
                if data[i:i+1] in WHITESPACE:
                    i += 1
                    continue
                if data[i:i+1] == b']':
                    i += 1
                    break
                c2 = data[i:i+1]
                if c2 == b'(':
                    s, j = parse_literal_string(data, i)
                    arr.append(('string', s))
                    i = j
                    continue
                if c2 == b'/':
                    j = i + 1
                    while j < n and data[j:j+1] not in WHITESPACE and data[j:j+1] not in DELIMS:
                        j += 1
                    arr.append(('name', data[i+1:j].decode('latin-1')))
                    i = j
                    continue
                if c2 == b'<':
                    if i+1 < n and data[i+1:i+2] == b'<':
                        j = data.find(b'>>', i+2)
                        if j == -1:
                            break
                        i = j + 2
                        continue
                    j = data.find(b'>', i+1)
                    if j == -1:
                        break
                    hexstr = re.sub(rb'\s+', b'', data[i+1:j])
                    if len(hexstr) % 2 == 1:
                        hexstr += b'0'
                    arr.append(('string', bytes.fromhex(hexstr.decode('latin-1'))))
                    i = j + 1
                    continue
                num, j = read_number(data, i)
                if num is not None:
                    arr.append(('number', num))
                    i = j
                    continue
                # operator token
                j = i
                while j < n and data[j:j+1] not in WHITESPACE and data[j:j+1] not in DELIMS:
                    j += 1
                arr.append(('op', data[i:j].decode('latin-1')))
                i = j
            yield ('array', arr)
            continue
        if c == b'<':
            if i+1 < n and data[i+1:i+2] == b'<':
                j = data.find(b'>>', i+2)
                if j == -1:
                    break
                i = j + 2
                continue
            j = data.find(b'>', i+1)
            if j == -1:
                break
            hexstr = re.sub(rb'\s+', b'', data[i+1:j])
            if len(hexstr) % 2 == 1:
                hexstr += b'0'
            yield ('string', bytes.fromhex(hexstr.decode('latin-1')))
            i = j + 1
            continue
        num, j = read_number(data, i)
        if num is not None:
            yield ('number', num)
            i = j
            continue
        j = i
        while j < n and data[j:j+1] not in WHITESPACE and data[j:j+1] not in DELIMS:
            j += 1
        if j == i:
            i += 1
            continue
        yield ('op', data[i:j].decode('latin-1'))
        i = j

# Matrix multiply

def matrix_multiply(m1, m2):
    a1,b1,c1,d1,e1,f1 = m1
    a2,b2,c2,d2,e2,f2 = m2
    return [
        a1*a2 + b1*c2,
        a1*b2 + b1*d2,
        c1*a2 + d1*c2,
        c1*b2 + d1*d2,
        e1*a2 + f1*c2 + e2,
        e1*b2 + f1*d2 + f2,
    ]


def decode_text(data_bytes, cmap):
    if not cmap:
        return data_bytes.decode('latin-1', errors='ignore')
    # determine code width
    code_width = 2 if any(k > 0xFF for k in cmap.keys()) else 1
    out = []
    if code_width == 2:
        if len(data_bytes) % 2 == 1:
            data_bytes = data_bytes + b'\x00'
        for i in range(0, len(data_bytes), 2):
            code = (data_bytes[i] << 8) + data_bytes[i+1]
            out.append(cmap.get(code, ''))
    else:
        for b in data_bytes:
            out.append(cmap.get(b, chr(b)))
    return ''.join(out)

# Extract text items per page
items = []
for page_index, stream_refs in enumerate(page_contents):
    font_map = page_font_maps[page_index] if page_index < len(page_font_maps) else {}
    for ref in stream_refs:
        obj = get_obj(ref)
        if not obj:
            continue
        sm = re.search(rb'stream\r?\n(.*?)\r?\nendstream', obj, re.S)
        if not sm:
            continue
        raw = sm.group(1)
        if b'/FlateDecode' in obj:
            try:
                data_stream = zlib.decompress(raw)
            except Exception:
                try:
                    data_stream = zlib.decompress(raw, -15)
                except Exception:
                    data_stream = raw
        else:
            data_stream = raw
        # parse tokens
        in_text = False
        text_matrix = [1,0,0,1,0,0]
        line_matrix = [1,0,0,1,0,0]
        leading = 0
        current_font = None
        stack = []
        for tok_type, tok_val in tokenize(data_stream):
            if tok_type in ('number','name','string','array'):
                stack.append((tok_type, tok_val))
                continue
            if tok_type != 'op':
                continue
            op = tok_val
            def pop(n):
                if len(stack) < n:
                    return None
                vals = stack[-n:]
                del stack[-n:]
                return vals
            if op == 'BT':
                in_text = True
                text_matrix = [1,0,0,1,0,0]
                line_matrix = [1,0,0,1,0,0]
                continue
            if op == 'ET':
                in_text = False
                continue
            if op == 'Tf':
                vals = pop(2)
                if not vals:
                    continue
                name = vals[0][1] if vals[0][0] == 'name' else None
                current_font = name
                continue
            if op == 'Tm':
                vals = pop(6)
                if not vals:
                    continue
                nums = [v for t,v in vals]
                text_matrix = nums
                line_matrix = nums[:]
                continue
            if op == 'Td' or op == 'TD':
                vals = pop(2)
                if not vals:
                    continue
                tx, ty = vals[0][1], vals[1][1]
                if op == 'TD':
                    leading = -ty
                # translate line matrix
                line_matrix = matrix_multiply(line_matrix, [1,0,0,1,tx,ty])
                text_matrix = line_matrix[:]
                continue
            if op == 'TL':
                vals = pop(1)
                if not vals:
                    continue
                leading = vals[0][1]
                continue
            if op == 'T*':
                # move to next line
                line_matrix = matrix_multiply(line_matrix, [1,0,0,1,0,-leading])
                text_matrix = line_matrix[:]
                continue
            if op == 'Tj':
                vals = pop(1)
                if not vals:
                    continue
                if not in_text:
                    continue
                sbytes = vals[0][1]
                cmap = font_map.get(current_font)
                text = decode_text(sbytes, cmap)
                if text:
                    items.append({
                        'page': page_index,
                        'x': text_matrix[4],
                        'y': text_matrix[5],
                        'text': text,
                        'font': current_font
                    })
                continue
            if op == 'TJ':
                vals = pop(1)
                if not vals:
                    continue
                if not in_text:
                    continue
                arr = vals[0][1] if vals[0][0] == 'array' else []
                sbytes = b''
                for t,v in arr:
                    if t == 'string':
                        sbytes += v
                cmap = font_map.get(current_font)
                text = decode_text(sbytes, cmap)
                if text:
                    items.append({
                        'page': page_index,
                        'x': text_matrix[4],
                        'y': text_matrix[5],
                        'text': text,
                        'font': current_font
                    })
                continue
            if op == "'":
                vals = pop(1)
                if not vals:
                    continue
                if not in_text:
                    continue
                # move to next line
                line_matrix = matrix_multiply(line_matrix, [1,0,0,1,0,-leading])
                text_matrix = line_matrix[:]
                sbytes = vals[0][1]
                cmap = font_map.get(current_font)
                text = decode_text(sbytes, cmap)
                if text:
                    items.append({
                        'page': page_index,
                        'x': text_matrix[4],
                        'y': text_matrix[5],
                        'text': text,
                        'font': current_font
                    })
                continue
            if op == '"':
                vals = pop(3)
                if not vals:
                    continue
                if not in_text:
                    continue
                # ignore spacing
                sbytes = vals[2][1]
                # move to next line
                line_matrix = matrix_multiply(line_matrix, [1,0,0,1,0,-leading])
                text_matrix = line_matrix[:]
                cmap = font_map.get(current_font)
                text = decode_text(sbytes, cmap)
                if text:
                    items.append({
                        'page': page_index,
                        'x': text_matrix[4],
                        'y': text_matrix[5],
                        'text': text,
                        'font': current_font
                    })
                continue

# Print sample items
print('pages', len(pages), 'items', len(items))
# show first 50 items
for item in items[:50]:
    print(item)

# collect unique texts to see headers
unique = sorted({i['text'] for i in items})
print('unique count', len(unique))
print('\n'.join(unique[:100]))
