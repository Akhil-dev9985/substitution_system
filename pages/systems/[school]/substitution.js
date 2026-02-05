import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import { getSchoolTimetable } from "../../../data/timetables";
import TimetableGrid from "../../../components/TimetableGrid";

const FREE_TOKENS = [
  "FREE",
  "LEISURE",
  "LUNCH",
  "BREAK",
  "OFF",
  "NA",
  "-"
];

const normalize = (value) =>
  value
    ? value.toString().replace(/\s+/g, "").toUpperCase()
    : "";

const isFree = (value) => {
  if (!value) return true;
  const cleaned = value.toString().trim().toUpperCase();
  return FREE_TOKENS.includes(cleaned);
};

const buildEmptySchedule = (days, periods) => {
  const schedule = {};
  days.forEach((day) => {
    schedule[day] = {};
    periods.forEach((period) => {
      schedule[day][period.id] = null;
    });
  });
  return schedule;
};

const countFree = (scheduleDay, periods) =>
  periods.reduce(
    (count, period) =>
      count + (isFree(scheduleDay?.[period.id]) ? 1 : 0),
    0
  );

const countBusy = (scheduleDay, periods) =>
  periods.reduce(
    (count, period) =>
      count + (isFree(scheduleDay?.[period.id]) ? 0 : 1),
    0
  );

const INDIA_TIMEZONE = "Asia/Kolkata";

const getIndiaDay = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: INDIA_TIMEZONE,
    weekday: "short"
  }).format(new Date());

const getIndiaDateKey = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const map = parts.reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
  return `${map.year}-${map.month}-${map.day}`;
};

const getIndiaDateLabel = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: INDIA_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());

const cloneAssignments = (value) =>
  JSON.parse(JSON.stringify(value || {}));

const escapeCsv = (value) => {
  if (value === null || value === undefined) return "";
  const text = value.toString();
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const parsePeriodStartMinutes = (label) => {
  if (!label) return null;
  const match = label.toString().match(/^(\d{1,2})[.:](\d{2})/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours >= 1 && hours <= 6) {
    hours += 12;
  }
  return hours * 60 + minutes;
};

const LOWER_CLASS_ALIAS = {
  "1": "I",
  "2": "II",
  G1: "I",
  G2: "II",
  GRADE1: "I",
  GRADE2: "II"
};

const RESTRICTED_TEACHER_DAYS = {
  D_M_K: new Set(["Mon", "Wed", "Fri"]),
  DMK: new Set(["Mon", "Wed", "Fri"])
};

const VITALIS_UID = "3VrwMgWEDoQekvqmXZGWJ4E7AFV2";
const VITALIS_EMAIL = "admin@vitallisschools.com";
const ADMIN_UID = "q17KO96ZiGa3PVQVcePjKlbXLED2";
const ADMIN_EMAIL = "user@test.com";

const isRestrictedDayAllowed = (teacherKey, day) => {
  const normalized = normalize(teacherKey);
  const allowed =
    RESTRICTED_TEACHER_DAYS[teacherKey] ||
    RESTRICTED_TEACHER_DAYS[normalized];
  if (!allowed) return true;
  return allowed.has(day);
};

const LOWER_CLASS_FALLBACK = {
  NUR: "DA",
  PP1: "PP2",
  PP2: "PP1",
  I: "II",
  II: "I"
};

const buildAssignmentsBySub = (assignmentsByAbsent) => {
  const assignmentsBySub = {};
  Object.entries(assignmentsByAbsent || {}).forEach(
    ([, days]) => {
      Object.entries(days || {}).forEach(([day, periods]) => {
        Object.entries(periods || {}).forEach(
          ([periodId, payload]) => {
            if (!payload?.substituteKey) return;
            if (!assignmentsBySub[payload.substituteKey])
              assignmentsBySub[payload.substituteKey] = {};
            if (!assignmentsBySub[payload.substituteKey][day])
              assignmentsBySub[payload.substituteKey][day] = {};
            assignmentsBySub[payload.substituteKey][day][
              periodId
            ] = payload;
          }
        );
      });
    }
  );
  return assignmentsBySub;
};

const pickByAvailability = (candidates, day, periods) => {
  if (!candidates.length) return null;
  return [...candidates].sort(
    (a, b) =>
      countFree(b.schedule?.[day], periods) -
      countFree(a.schedule?.[day], periods)
  )[0];
};

const pickByLoad = (candidates, day, periods) => {
  if (!candidates.length) return null;
  return [...candidates].sort(
    (a, b) =>
      countBusy(a.schedule?.[day], periods) -
      countBusy(b.schedule?.[day], periods)
  )[0];
};

const getScheduleForTeacher = (teacher, teacherMap, days, periods) => {
  const codeKey = normalize(teacher.code);
  const nameKey = normalize(teacher.name);
  return (
    teacherMap.get(codeKey) ||
    teacherMap.get(nameKey) ||
    buildEmptySchedule(days, periods)
  );
};

const generateSubstitutions = ({
  teachers,
  absentKeys,
  priorityKeys,
  days,
  periods,
  teacherMap,
  classTeacherKeysByClass,
  getLowerClassKeyFromInfo
}) => {
  const absentSet = new Set(absentKeys);
  const prioritySet = new Set(priorityKeys);
  const assignmentsByAbsent = {};
  const assignmentsBySub = {};
  const occupied = {};
  const cascaded = new Set();

  const pool = teachers
    .map((teacher) => {
      const key = normalize(teacher.code || teacher.name);
      return {
        ...teacher,
        key,
        schedule: getScheduleForTeacher(
          teacher,
          teacherMap,
          days,
          periods
        )
      };
    })
    .filter((teacher) => teacher.key);

  const markOccupied = (key, day, period) => {
    const slot = `${day}-${period}`;
    if (!occupied[slot]) occupied[slot] = new Set();
    occupied[slot].add(key);
  };

  const isOccupied = (key, day, period) => {
    const slot = `${day}-${period}`;
    return occupied[slot]?.has(key);
  };

  const assignSub = (
    absentKey,
    day,
    period,
    payload,
    substituteKey
  ) => {
    const enrichedPayload = substituteKey
      ? { ...payload, substituteKey }
      : payload;
    if (!assignmentsByAbsent[absentKey])
      assignmentsByAbsent[absentKey] = {};
    if (!assignmentsByAbsent[absentKey][day])
      assignmentsByAbsent[absentKey][day] = {};
    assignmentsByAbsent[absentKey][day][period] =
      enrichedPayload;

    if (substituteKey) {
      if (!assignmentsBySub[substituteKey])
        assignmentsBySub[substituteKey] = {};
      if (!assignmentsBySub[substituteKey][day])
        assignmentsBySub[substituteKey][day] = {};
      assignmentsBySub[substituteKey][day][period] =
        enrichedPayload;
      markOccupied(substituteKey, day, period);
    }
  };

  const getTeacherByKey = (key) =>
    pool.find((teacher) => teacher.key === key);

  const assignCoverageForTeacher = (
    teacherKey,
    day,
    periodId,
    classInfo
  ) => {
    if (!teacherKey) return;
    const slotKey = `${teacherKey}-${day}-${periodId}`;
    if (cascaded.has(slotKey)) return;
    cascaded.add(slotKey);

    const candidates = pool.filter(
      (teacher) =>
        !absentSet.has(teacher.key) &&
        teacher.key !== teacherKey &&
        !isOccupied(teacher.key, day, periodId) &&
        isRestrictedDayAllowed(teacher.key, day)
    );
    const freeCandidates = candidates.filter((teacher) =>
      isFree(teacher.schedule?.[day]?.[periodId])
    );
    const priorityFree = freeCandidates.filter((teacher) =>
      prioritySet.has(teacher.key)
    );

    let chosen = pickByAvailability(priorityFree, day, periods);
    let type = "SUB";

    if (!chosen) {
      chosen = pickByAvailability(freeCandidates, day, periods);
    }

    if (!chosen) {
      const priorityClub = candidates.filter((teacher) =>
        prioritySet.has(teacher.key)
      );
      chosen = pickByLoad(priorityClub, day, periods);
      type = "CLUB";
    }

    if (!chosen) {
      chosen = pickByLoad(candidates, day, periods);
      type = "CLUB";
    }

    if (!chosen) {
      assignSub(teacherKey, day, periodId, {
        type: "UNASSIGNED",
        classInfo
      });
      return;
    }

    assignSub(
      teacherKey,
      day,
      periodId,
      {
        type,
        classInfo,
        substitute: chosen.name || chosen.code
      },
      chosen.key
    );
  };

  absentKeys.forEach((absentKey) => {
    const absentTeacher = pool.find(
      (teacher) => teacher.key === absentKey
    );
    if (!absentTeacher) return;

    days.forEach((day) => {
      periods.forEach((period) => {
        const classInfo =
          absentTeacher.schedule?.[day]?.[period.id];
        if (isFree(classInfo)) return;

        const lowerClassKey = getLowerClassKeyFromInfo
          ? getLowerClassKeyFromInfo(classInfo)
          : null;
        const classTeacherKey = lowerClassKey
          ? classTeacherKeysByClass?.get(lowerClassKey)
          : null;

        if (lowerClassKey && classTeacherKey) {
          const classTeacherAbsent = absentSet.has(
            classTeacherKey
          );
          const periodStart = parsePeriodStartMinutes(
            period.label
          );

          if (!classTeacherAbsent) {
            const classTeacher = getTeacherByKey(
              classTeacherKey
            );
            if (classTeacher) {
              assignSub(
                absentKey,
                day,
                period.id,
                {
                  type: "SUB",
                  classInfo,
                  substitute:
                    classTeacher.name || classTeacher.code,
                  locked: true
                },
                classTeacher.key
              );
              return;
            }
          }

          if (classTeacherAbsent) {
            const fallbackTarget = LOWER_CLASS_FALLBACK[
              lowerClassKey
            ];
            const fallbackKey =
              fallbackTarget === "DA"
                ? "DA"
                : classTeacherKeysByClass?.get(fallbackTarget);
            const fallbackTeacher = fallbackKey
              ? getTeacherByKey(fallbackKey)
              : null;
            const afterOnePm =
              periodStart === null || periodStart >= 780;

            if (fallbackTeacher) {
              assignSub(
                absentKey,
                day,
                period.id,
                {
                  type: "SUB",
                  classInfo,
                  substitute:
                    fallbackTeacher.name ||
                    fallbackTeacher.code,
                  locked: true
                },
                fallbackTeacher.key
              );

              if (fallbackKey === "DA" && periodStart !== null) {
                const teacherClassInfo =
                  fallbackTeacher.schedule?.[day]?.[period.id];
                if (!isFree(teacherClassInfo)) {
                  assignCoverageForTeacher(
                    fallbackTeacher.key,
                    day,
                    period.id,
                    teacherClassInfo
                  );
                }
              }
              return;
            }
          }

          return;
        }

        const periodStart = parsePeriodStartMinutes(period.label);
        const candidates = pool.filter(
          (teacher) =>
            !absentSet.has(teacher.key) &&
            !isOccupied(teacher.key, day, period.id) &&
            isRestrictedDayAllowed(teacher.key, day) &&
            (normalize(teacher.key) !== "DA" ||
              periodStart === null ||
              periodStart >= 780)
        );
        const freeCandidates = candidates.filter((teacher) =>
          isFree(teacher.schedule?.[day]?.[period.id])
        );
        const priorityFree = freeCandidates.filter((teacher) =>
          prioritySet.has(teacher.key)
        );

        let chosen = pickByAvailability(
          priorityFree,
          day,
          periods
        );
        let type = "SUB";

        if (!chosen) {
          chosen = pickByAvailability(
            freeCandidates,
            day,
            periods
          );
        }

        if (!chosen) {
          const priorityClub = candidates.filter((teacher) =>
            prioritySet.has(teacher.key)
          );
          chosen = pickByLoad(priorityClub, day, periods);
          type = "CLUB";
        }

        if (!chosen) {
          chosen = pickByLoad(candidates, day, periods);
          type = "CLUB";
        }

        if (!chosen) {
          assignSub(absentKey, day, period.id, {
            type: "UNASSIGNED",
            classInfo
          });
          return;
        }

        assignSub(
          absentKey,
          day,
          period.id,
          {
            type,
            classInfo,
            substitute: chosen.name || chosen.code
          },
          chosen.key
        );
      });
    });
  });

  return { assignmentsByAbsent, assignmentsBySub, pool };
};

export default function SubstitutionPage() {
  const router = useRouter();
  const { school } = router.query;
  const [teachers, setTeachers] = useState([]);
  const [absent, setAbsent] = useState([]);
  const [priority, setPriority] = useState([]);
  const [step, setStep] = useState("absent");
  const [manualOverrides, setManualOverrides] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const timetable = useMemo(
    () => getSchoolTimetable(school),
    [school]
  );
  const indiaDay = getIndiaDay();
  const indiaDateKey = getIndiaDateKey();
  const indiaDateLabel = useMemo(
    () => getIndiaDateLabel(),
    [indiaDateKey]
  );
  const classTeachers = useMemo(
    () => timetable.classTeachers || {},
    [timetable.classTeachers]
  );
  const activeDays = useMemo(
    () =>
      timetable.days.includes(indiaDay)
        ? [indiaDay]
        : [],
    [indiaDay, timetable.days]
  );

  useEffect(() => {
    if (!router.isReady || !school) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
        return;
      }
      const schoolSlug = school?.toString().toLowerCase();
      const email = user.email?.toLowerCase();
      const isAdminUser =
        user.uid === ADMIN_UID || email === ADMIN_EMAIL;
      const isVitalisUser =
        user.uid === VITALIS_UID || email === VITALIS_EMAIL;
      if (isAdminUser) return;
      if (isVitalisUser && schoolSlug !== "vitalis") {
        router.replace("/systems/vitalis");
        return;
      }
      if (!isVitalisUser && schoolSlug === "vitalis") {
        router.replace("/");
      }
    });
    const q = query(
      collection(db, "teachers"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((teacher) => teacher.school === school);
      setTeachers(list);
    });

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, [router.isReady, school]);

  const teacherMap = useMemo(() => {
    const map = new Map();
    Object.entries(timetable.teacherTimetable || {}).forEach(
      ([key, schedule]) => {
        map.set(normalize(key), schedule);
      }
    );
    return map;
  }, [timetable]);

  const classTeacherKeysByClass = useMemo(() => {
    const map = new Map();
    Object.entries(classTeachers).forEach(([cls, teacher]) => {
      const key = normalize(teacher?.code || teacher?.name);
      if (key) map.set(cls.toString().toUpperCase(), key);
    });
    return map;
  }, [classTeachers]);

  const lowerClassTeacherKeys = useMemo(() => {
    const set = new Set();
    ["NUR", "PP1", "PP2", "I", "II"].forEach((cls) => {
      const key = classTeacherKeysByClass.get(cls);
      if (key) set.add(key);
    });
    return set;
  }, [classTeacherKeysByClass]);

  const getLowerClassKeyFromInfo = useCallback(
    (classInfo) => {
      if (!classInfo) return null;
      const raw = classInfo.toString().toUpperCase();
      const tokens = raw.split(/[^A-Z0-9]+/).filter(Boolean);
      const candidates = new Set(tokens);
      candidates.add(raw);
      for (const token of candidates) {
        if (classTeacherKeysByClass.has(token)) return token;
        const alias = LOWER_CLASS_ALIAS[token];
        if (alias && classTeacherKeysByClass.has(alias)) {
          return alias;
        }
      }
      return null;
    },
    [classTeacherKeysByClass]
  );


  const absentKeys = useMemo(
    () =>
      absent.map((teacher) =>
        normalize(teacher.code || teacher.name)
      ),
    [absent]
  );
  const priorityKeys = useMemo(
    () =>
      priority.map((teacher) =>
        normalize(teacher.code || teacher.name)
      ),
    [priority]
  );
  const absentSet = useMemo(
    () => new Set(absentKeys),
    [absentKeys]
  );
  const prioritySet = useMemo(
    () => new Set(priorityKeys),
    [priorityKeys]
  );

  useEffect(() => {
    if (priority.length === 0) return;
    const filtered = priority.filter(
      (teacher) =>
        !absentKeys.includes(
          normalize(teacher.code || teacher.name)
        )
    );
    if (filtered.length !== priority.length) {
      setPriority(filtered);
    }
  }, [absentKeys, priority]);
  useEffect(() => {
    setSaveStatus("idle");
  }, [absentKeys, priorityKeys]);

  const { assignmentsByAbsent, pool } =
    useMemo(
      () =>
        generateSubstitutions({
          teachers,
          absentKeys,
          priorityKeys,
          days: activeDays,
          periods: timetable.periods,
          teacherMap,
          classTeacherKeysByClass,
          getLowerClassKeyFromInfo
        }),
      [
        teachers,
        absentKeys,
        priorityKeys,
        activeDays,
        timetable.periods,
        teacherMap,
        classTeacherKeysByClass,
        getLowerClassKeyFromInfo
      ]
    );
  const mergedAssignments = useMemo(() => {
    const byAbsent = cloneAssignments(assignmentsByAbsent);
    Object.entries(manualOverrides).forEach(
      ([absentKey, days]) => {
        Object.entries(days || {}).forEach(
          ([day, periods]) => {
            Object.entries(periods || {}).forEach(
              ([periodId, substituteKey]) => {
                if (
                  !byAbsent?.[absentKey]?.[day]?.[periodId]
                )
                  return;
                const substituteTeacher = pool.find(
                  (teacher) => teacher.key === substituteKey
                );
                if (!substituteTeacher) return;
                byAbsent[absentKey][day][periodId] = {
                  ...byAbsent[absentKey][day][periodId],
                  type: "SUB",
                  substitute:
                    substituteTeacher.name ||
                    substituteTeacher.code,
                  substituteKey: substituteTeacher.key,
                  manualOverride: true
                };
              }
            );
          }
        );
      }
    );
    const bySub = buildAssignmentsBySub(byAbsent);
    return { byAbsent, bySub };
  }, [assignmentsByAbsent, manualOverrides, pool]);
  const displayAssignmentsByAbsent = mergedAssignments.byAbsent;
  const displayAssignmentsBySub = mergedAssignments.bySub;

  const diaryRows = useMemo(() => {
    if (!activeDays.length) return [];
    const day = activeDays[0];
    const rows = [];
    absent.forEach((teacher) => {
      const absentKey = normalize(teacher.code || teacher.name);
      const dayAssignments =
        displayAssignmentsByAbsent?.[absentKey]?.[day];
      if (!dayAssignments) return;
      timetable.periods.forEach((period) => {
        const assignment = dayAssignments[period.id];
        if (!assignment) return;
        rows.push({
          absent: `${teacher.name || "Unknown"} (${
            teacher.code || "NO-CODE"
          })`,
          substitute: assignment.substitute || "Unassigned",
          periodLabel: period.label || period.id,
          periodId: period.id
        });
      });
    });
    return rows;
  }, [absent, activeDays, displayAssignmentsByAbsent, timetable.periods]);

  useEffect(() => {
    setManualOverrides({});
  }, [assignmentsByAbsent]);

  const occupiedBySlot = useMemo(() => {
    const occupied = {};
    Object.entries(displayAssignmentsBySub).forEach(
      ([subKey, days]) => {
        Object.entries(days || {}).forEach(
          ([day, periods]) => {
            Object.keys(periods || {}).forEach((periodId) => {
              const slot = `${day}-${periodId}`;
              if (!occupied[slot]) occupied[slot] = new Set();
              occupied[slot].add(subKey);
            });
          }
        );
      }
    );
    return occupied;
  }, [displayAssignmentsBySub]);

  const getAvailableSubstitutes = useCallback(
    (absentKey, day, periodId, currentSubKey) => {
      const slot = `${day}-${periodId}`;
      const occupied = occupiedBySlot[slot] || new Set();
      const assignment =
        displayAssignmentsByAbsent?.[absentKey]?.[day]?.[periodId];
      const lowerClassKey = getLowerClassKeyFromInfo(
        assignment?.classInfo
      );
      const classTeacherKey = lowerClassKey
        ? classTeacherKeysByClass.get(lowerClassKey)
        : null;
      const classTeacherAbsent =
        classTeacherKey && absentSet.has(classTeacherKey);
      const periodLabel =
        timetable.periods.find((p) => p.id === periodId)?.label ||
        "";
      const periodStart = parsePeriodStartMinutes(periodLabel);
      if (lowerClassKey) {
        return [];
      }
      const candidates = pool.filter((teacher) => {
        if (!teacher.key) return false;
        if (teacher.key === absentKey) return false;
        if (absentSet.has(teacher.key)) return false;
        if (!isRestrictedDayAllowed(teacher.key, day)) return false;
        if (
          normalize(teacher.key) === "DA" &&
          periodStart !== null &&
          periodStart < 780
        )
          return false;
        if (
          !isFree(teacher.schedule?.[day]?.[periodId])
        )
          return false;
        if (
          occupied.has(teacher.key) &&
          teacher.key !== currentSubKey
        )
          return false;
        return true;
      });
      if (classTeacherKey && !classTeacherAbsent) {
        const classTeacher = candidates.find(
          (teacher) => teacher.key === classTeacherKey
        );
        if (classTeacher) {
          const freeCount = countFree(
            classTeacher.schedule?.[day],
            timetable.periods
          );
          return [
            {
              key: classTeacher.key,
              label: `${classTeacher.name || classTeacher.code || "NO-CODE"} (${
                classTeacher.code || "NO-CODE"
              }) - ${freeCount} free`
            }
          ];
        }
      }
      const limitedCandidates =
        classTeacherKey &&
        classTeacherAbsent &&
        lowerClassTeacherKeys.size > 0
          ? candidates.filter((teacher) =>
              lowerClassTeacherKeys.has(teacher.key)
            )
          : candidates;
      const ranked = limitedCandidates.map((teacher) => ({
        ...teacher,
        freeCount: countFree(
          teacher.schedule?.[day],
          timetable.periods
        )
      }));
      ranked.sort((a, b) => {
        const freeDiff =
          Math.min(2, b.freeCount) - Math.min(2, a.freeCount);
        if (freeDiff) return freeDiff;
        const priorityDiff =
          Number(prioritySet.has(b.key)) -
          Number(prioritySet.has(a.key));
        if (priorityDiff) return priorityDiff;
        const aLabel = a.name || a.code || "";
        const bLabel = b.name || b.code || "";
        return aLabel.localeCompare(bLabel);
      });
      return ranked.map((teacher) => ({
        key: teacher.key,
        label: `${teacher.name || teacher.code || "NO-CODE"} (${
          teacher.code || "NO-CODE"
        }) - ${teacher.freeCount} free`
      }));
    },
    [
      absentSet,
      occupiedBySlot,
      pool,
      prioritySet,
      timetable.periods,
      displayAssignmentsByAbsent,
      getLowerClassKeyFromInfo,
      classTeacherKeysByClass,
      lowerClassTeacherKeys
    ]
  );

  const handleSubstituteOverride = useCallback(
    (absentKey, day, periodId, substituteKey) => {
      setManualOverrides((prev) => ({
        ...prev,
        [absentKey]: {
          ...prev[absentKey],
          [day]: {
            ...prev[absentKey]?.[day],
            [periodId]: substituteKey
          }
        }
      }));
    },
    []
  );

  const handleExportDiary = useCallback(
    (format) => {
      if (diaryRows.length === 0) return;
      let content = "";
      let mimeType = "text/plain;charset=utf-8;";
      let extension = "txt";

      if (format === "csv") {
        const headers = [
          "S.No",
          "Absent Teacher",
          "Substituted Teacher",
          "Period",
          "Signature"
        ];
        const lines = [headers.join(",")];
        diaryRows.forEach((row, index) => {
          lines.push(
            [
              index + 1,
              row.absent,
              row.substitute,
              row.periodLabel,
              ""
            ]
              .map(escapeCsv)
              .join(",")
          );
        });
        content = lines.join("\n");
        mimeType = "text/csv;charset=utf-8;";
        extension = "csv";
      }

      if (format === "json") {
        content = JSON.stringify(
          diaryRows.map((row, index) => ({
            sno: index + 1,
            absentTeacher: row.absent,
            substitutedTeacher: row.substitute,
            period: row.periodLabel,
            signature: ""
          })),
          null,
          2
        );
        mimeType = "application/json;charset=utf-8;";
        extension = "json";
      }

      if (format === "pdf") {
        if (typeof window === "undefined") return;
        const title = `Substitution Diary - ${indiaDay}, ${indiaDateLabel}`;
        const rowsHtml = diaryRows
          .map(
            (row, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(row.absent)}</td>
              <td>${escapeHtml(row.substitute)}</td>
              <td>${escapeHtml(row.periodLabel)}</td>
              <td><div class="signature-line"></div></td>
            </tr>`
          )
          .join("");
        const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1 { font-size: 18px; margin: 0 0 12px; }
      .meta { margin-bottom: 16px; font-size: 12px; color: #333; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background: #f3f4f6; }
      .signature-line { border-bottom: 1px solid #111; height: 18px; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">Generated on ${escapeHtml(
      indiaDateLabel
    )}</div>
    <table>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Absent Teacher</th>
          <th>Substituted Teacher</th>
          <th>Period</th>
          <th>Signature</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </body>
</html>`;
        const printWindow = window.open(
          "",
          "_blank",
          "width=900,height=650"
        );
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
        printWindow.onafterprint = () => {
          printWindow.close();
        };
        return;
      }

      if (!content) return;
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `substitution_diary_${indiaDateKey}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [diaryRows, indiaDateKey]
  );

  const saveSubstitutionRun = useCallback(async () => {
    if (!school || isSaving || absent.length === 0) return;
    setIsSaving(true);
    setSaveStatus("saving");
    try {
      await addDoc(collection(db, "substitution_runs"), {
        school: school.toString().toLowerCase(),
        day: indiaDay,
        dateKey: indiaDateKey,
        absent: absent.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          code: teacher.code || ""
        })),
        priority: priority.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          code: teacher.code || ""
        })),
        assignmentsByAbsent: displayAssignmentsByAbsent,
        assignmentsBySub: displayAssignmentsBySub,
        createdAt: serverTimestamp()
      });
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [
    absent,
    displayAssignmentsByAbsent,
    displayAssignmentsBySub,
    indiaDateKey,
    indiaDay,
    isSaving,
    priority,
    school
  ]);

  const handleContinue = async () => {
    if (step === "absent") {
      setStep("priority");
      return;
    }
    if (step === "priority") {
      setStep("result");
      await saveSubstitutionRun();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!router.isReady) return null;

  const schoolName = school?.toString().toUpperCase() || "SCHOOL";
  const missingTimetable = teachers.filter((teacher) => {
    const key = normalize(teacher.code || teacher.name);
    return !teacherMap.get(key);
  });

  const toggleTeacher = (teacher, list, setList) => {
    const key = normalize(teacher.code || teacher.name);
    const exists = list.find(
      (item) => normalize(item.code || item.name) === key
    );
    if (exists) {
      setList(list.filter((item) =>
        normalize(item.code || item.name) !== key
      ));
      return;
    }
    setList([...list, teacher]);
  };

  const availablePriorityTeachers = teachers.filter(
    (teacher) =>
      !absentKeys.includes(normalize(teacher.code || teacher.name))
  );

  const stepConfig = [
    { id: "absent", label: "Absent Teachers" },
    { id: "priority", label: "Priority Substitutes" },
    { id: "result", label: "Generated Plan" }
  ];

  return (
    <div className="page-container system-page">
      <div className="page-shell fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Substitution Engine</p>
            <h1 className="section-title">
              {schoolName} Coverage Builder
            </h1>
            <p className="section-subtitle">
              Select absent staff, set priority substitutes, and
              generate a coverage plan with highlighted timetables.
            </p>
          </div>
          <div className="header-actions">
            <span className="chip">
              <span className="status-dot" /> Live Planning
            </span>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="step-tabs">
          {stepConfig.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`step-tab ${
                step === item.id ? "active" : ""
              }`}
              onClick={() => setStep(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {missingTimetable.length > 0 && (
          <div className="notice-card">
            Timetable data missing for {missingTimetable.length}{" "}
            teachers. Update `data/timetables.js` with data from the
            CSVs in `tt/` to enable accurate substitutions.
          </div>
        )}

        {step === "absent" && (
          <section className="step-panel">
            <div className="panel-header">
              <div>
                <h3 className="section-title">Mark Absent</h3>
                <p className="section-subtitle">
                  Choose the teachers who are absent today.
                </p>
              </div>
              <span className="tag">{absent.length} Selected</span>
            </div>

            <div className="teacher-list">
              {teachers.map((teacher) => {
                const key = normalize(
                  teacher.code || teacher.name
                );
                const selected = absentKeys.includes(key);
                return (
                  <label
                    key={teacher.id}
                    className={`teacher-pill ${
                      selected ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleTeacher(teacher, absent, setAbsent)
                      }
                    />
                    <div>
                      <div className="teacher-name">
                        {teacher.name}
                      </div>
                      <div className="teacher-code mono">
                        {teacher.code || "NO-CODE"}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {teachers.length === 0 && (
              <div className="empty-state">
                No teachers found for {schoolName}. Add teachers first
                to build substitution plans.
              </div>
            )}
          </section>
        )}

        {step === "priority" && (
          <section className="step-panel">
            <div className="panel-header">
              <div>
                <h3 className="section-title">Priority List</h3>
                <p className="section-subtitle">
                  Pick the teachers you want to prioritize for cover.
                </p>
              </div>
              <span className="tag">{priority.length} Priority</span>
            </div>

            <div className="teacher-list">
              {availablePriorityTeachers.map((teacher) => {
                const key = normalize(
                  teacher.code || teacher.name
                );
                const selected = priorityKeys.includes(key);
                return (
                  <label
                    key={teacher.id}
                    className={`teacher-pill ${
                      selected ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleTeacher(
                          teacher,
                          priority,
                          setPriority
                        )
                      }
                    />
                    <div>
                      <div className="teacher-name">
                        {teacher.name}
                      </div>
                      <div className="teacher-code mono">
                        {teacher.code || "NO-CODE"}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {step === "result" && (
          <section className="step-panel">
            <div className="panel-header">
              <div>
                <h3 className="section-title">Generated Coverage</h3>
                <p className="section-subtitle">
                  Substitution assignments are highlighted in both
                  absent and substitute timetables.
                </p>
              </div>
              <span className="tag">
                {absent.length} Absent
              </span>
            </div>

            {saveStatus === "saved" && (
              <div className="notice-card info">
                Saved run for {indiaDateKey} ({indiaDay}).
              </div>
            )}
            {saveStatus === "error" && (
              <div className="notice-card">
                Unable to save this run. Please try again.
              </div>
            )}

            <div className="substitution-board diary-card">
              <div className="panel-header">
                <div>
                  <h3 className="section-title">
                    Substitution Diary
                  </h3>
                  <p className="section-subtitle">
                    Today: {indiaDay}, {indiaDateLabel}
                  </p>
                </div>
                <div className="export-menu">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() =>
                      setExportOpen((prev) => !prev)
                    }
                    disabled={diaryRows.length === 0}
                  >
                    Export
                  </button>
                  <div
                    className={`export-dropdown ${
                      exportOpen ? "open" : ""
                    }`}
                  >
                    <button
                      className="export-option"
                      type="button"
                      onClick={() => {
                        setExportOpen(false);
                        handleExportDiary("csv");
                      }}
                    >
                      CSV
                    </button>
                    <button
                      className="export-option"
                      type="button"
                      onClick={() => {
                        setExportOpen(false);
                        handleExportDiary("json");
                      }}
                    >
                      JSON
                    </button>
                    <button
                      className="export-option"
                      type="button"
                      onClick={() => {
                        setExportOpen(false);
                        handleExportDiary("pdf");
                      }}
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              {activeDays.length === 0 && (
                <div className="empty-state">
                  No timetable day detected for today ({indiaDay}).
                </div>
              )}

              {activeDays.length > 0 && diaryRows.length === 0 && (
                <div className="empty-state">
                  No substitutions recorded for today yet.
                </div>
              )}

              {diaryRows.length > 0 && (
                <div className="table-container">
                  <table className="teachers-table diary-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Absent Teacher</th>
                        <th>Substituted Teacher</th>
                        <th>Period</th>
                        <th>Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diaryRows.map((row, index) => (
                        <tr
                          key={`${row.absent}-${row.periodId}-${index}`}
                        >
                          <td className="mono">{index + 1}</td>
                          <td>{row.absent}</td>
                          <td>{row.substitute}</td>
                          <td>{row.periodLabel}</td>
                          <td className="signature-cell">
                            <span className="signature-line" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="notice-card info">
              Lower-grade rules: NUR is assigned to Aparna (DA). PP1 is
              assigned to PP2 CT and PP2 is assigned to PP1 CT. Grade 1
              is assigned to Grade 2 CT and Grade 2 is assigned to
              Grade 1 CT.
            </div>

            <div className="notice-card info">
              Priority logic: teachers with 2 free periods are selected
              first, then 1 free period, and finally class clubbing if
              needed.
            </div>

            {absent.length === 0 && (
              <div className="empty-state">
                Select absent teachers to generate a plan.
              </div>
            )}

            {absent.length > 0 && (
              <div className="result-grid">
                {absent.map((teacher) => {
                  const key = normalize(
                    teacher.code || teacher.name
                  );
                  const schedule = getScheduleForTeacher(
                    teacher,
                    teacherMap,
                    timetable.days,
                    timetable.periods
                  );
                  const substitutions =
                    displayAssignmentsByAbsent[key] || {};
                  return (
                    <div key={teacher.id} className="card">
                      <h4>
                        {teacher.name} (
                        {teacher.code || "NO-CODE"})
                      </h4>
                      <p className="muted">
                        Highlighted slots show substitutions.
                      </p>
                      <TimetableGrid
                        days={timetable.days}
                        periods={timetable.periods}
                        schedule={schedule}
                        substitutions={substitutions}
                        mode="absent"
                        availableSubstitutes={(
                          day,
                          periodId,
                          assignment
                        ) =>
                          getAvailableSubstitutes(
                            key,
                            day,
                            periodId,
                            assignment?.substituteKey
                          )
                        }
                        onSelectSubstitute={(day, periodId, value) =>
                          handleSubstituteOverride(
                            key,
                            day,
                            periodId,
                            value
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="divider" />

            <div className="panel-header">
              <div>
                <h3 className="section-title">Substitute Impact</h3>
                <p className="section-subtitle">
                  Teachers highlighted below are covering additional
                  classes.
                </p>
              </div>
            </div>

            <div className="result-grid">
              {Object.keys(displayAssignmentsBySub).length ===
                0 && (
                <div className="empty-state">
                  No substitute assignments generated yet.
                </div>
              )}

              {Object.entries(displayAssignmentsBySub).map(
                ([subKey, assignments]) => {
                  const teacher = pool.find(
                    (item) => item.key === subKey
                  );
                  if (!teacher) return null;
                  return (
                    <div key={subKey} className="card">
                      <h4>
                        {teacher.name} (
                        {teacher.code || "NO-CODE"})
                      </h4>
                      <p className="muted">
                        Substitution slots are highlighted.
                      </p>
                      <TimetableGrid
                        days={timetable.days}
                        periods={timetable.periods}
                        schedule={teacher.schedule}
                        substitutions={assignments}
                        mode="sub"
                      />
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        <div className="step-actions">
          {step !== "absent" && (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() =>
                setStep(
                  step === "priority" ? "absent" : "priority"
                )
              }
            >
              Back
            </button>
          )}
          {step !== "result" && (
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleContinue}
              disabled={isSaving}
            >
              {step === "priority" ? "Generate Plan" : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

