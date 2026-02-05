export default function TimetableGrid({
  days,
  periods,
  schedule,
  substitutions,
  mode,
  availableSubstitutes,
  onSelectSubstitute
}) {
  return (
    <div className="timetable-grid">
      <table className="timetable">
        <thead>
          <tr>
            <th>Period</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.id}>
              <td className="period-label">
                <div>{period.id}</div>
                <span className="muted">{period.label}</span>
              </td>
              {days.map((day) => {
                const cellValue = schedule?.[day]?.[period.id];
                const assignment =
                  substitutions?.[day]?.[period.id];
                const isHighlighted = Boolean(assignment);
                const statusLabel = assignment
                  ? assignment.type === "CLUB"
                    ? "Clubbed"
                    : assignment.type === "UNASSIGNED"
                    ? "Unassigned"
                    : "Sub"
                  : "";
                const options =
                  assignment?.substituteKey &&
                  availableSubstitutes
                    ? availableSubstitutes(
                        day,
                        period.id,
                        assignment
                      )
                    : [];
                const hasOptions =
                  assignment?.substituteKey && options?.length;
                const selectedKey = assignment?.substituteKey;
                const finalOptions =
                  hasOptions &&
                  selectedKey &&
                  !options.find((opt) => opt.key === selectedKey)
                    ? [
                        {
                          key: selectedKey,
                          label:
                            assignment.substitute || selectedKey
                        },
                        ...options
                      ]
                    : options;
                return (
                  <td
                    key={`${day}-${period.id}`}
                    className={`cell ${
                      isHighlighted ? "highlight" : ""
                    } ${assignment?.type === "CLUB" ? "club" : ""} ${
                      assignment?.type === "UNASSIGNED"
                        ? "unassigned"
                        : ""
                    }`}
                  >
                    <div className="cell-main">
                      {cellValue || "-"}
                    </div>
                    {assignment && (
                      <div className="cell-sub">
                        {statusLabel}
                        {assignment.substitute
                          ? ` - ${assignment.substitute}`
                          : ""}
                        {mode === "sub" &&
                          assignment.classInfo && (
                            <div className="muted">
                              {assignment.classInfo}
                            </div>
                          )}
                        {assignment.manualOverride && (
                          <span className="saved-indicator">
                            Saved
                          </span>
                        )}
                      </div>
                    )}
                    {hasOptions && !assignment?.locked && (
                      <select
                        className="substitute-select"
                        value={selectedKey}
                        onChange={(event) =>
                          onSelectSubstitute?.(
                            day,
                            period.id,
                            event.target.value
                          )
                        }
                      >
                        {finalOptions.map((option) => (
                          <option
                            key={option.key}
                            value={option.key}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
