import { useMemo } from "react";
import { useRouter } from "next/router";
import { getSchoolTimetable } from "../../../data/timetables";
import TimetableGrid from "../../../components/TimetableGrid";

export default function TimetablesPage() {
  const router = useRouter();
  const { school } = router.query;
  const timetable = useMemo(
    () => getSchoolTimetable(school),
    [school]
  );

  if (!router.isReady) return null;

  const schoolName = school?.toString().toUpperCase() || "SCHOOL";
  const teacherEntries = Object.entries(
    timetable.teacherTimetable || {}
  );
  const classEntries = Object.entries(
    timetable.classTimetable || {}
  );

  return (
    <div className="page-container system-page">
      <div className="page-shell fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Timetables</p>
            <h1 className="section-title">
              {schoolName} Timetable Library
            </h1>
            <p className="section-subtitle">
              Browse teacher and class schedules synced from the CSV
              files.
            </p>
          </div>
          <span className="chip">
            <span className="status-dot" /> Live Data
          </span>
        </header>

        <section className="step-panel">
          <div className="panel-header">
            <div>
              <h3 className="section-title">Teacher Timetables</h3>
              <p className="section-subtitle">
                Schedules are keyed by teacher code.
              </p>
            </div>
            <span className="tag">
              {teacherEntries.length} Teachers
            </span>
          </div>

          {teacherEntries.length === 0 && (
            <div className="empty-state">
              No teacher timetable data available.
            </div>
          )}

          {teacherEntries.length > 0 && (
            <div className="result-grid">
              {teacherEntries.map(([code, schedule]) => (
                <div key={code} className="card">
                  <h4>{code}</h4>
                  <TimetableGrid
                    days={timetable.days}
                    periods={timetable.periods}
                    schedule={schedule}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="divider" />

        <section className="step-panel">
          <div className="panel-header">
            <div>
              <h3 className="section-title">Class Timetables</h3>
              <p className="section-subtitle">
                Homeroom schedules for each class.
              </p>
            </div>
            <span className="tag">
              {classEntries.length} Classes
            </span>
          </div>

          {classEntries.length === 0 && (
            <div className="empty-state">
              No class timetable data available.
            </div>
          )}

          {classEntries.length > 0 && (
            <div className="result-grid">
              {classEntries.map(([name, schedule]) => (
                <div key={name} className="card">
                  <h4>{name}</h4>
                  <TimetableGrid
                    days={timetable.days}
                    periods={timetable.periods}
                    schedule={schedule}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
