import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db } from "../../../lib/firebase";
import { auth } from "../../../lib/firebase";

const INDIA_TIMEZONE = "Asia/Kolkata";

const getIndiaNow = () =>
  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: INDIA_TIMEZONE
    })
  );

const pad2 = (value) => value.toString().padStart(2, "0");

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;

const getWeekRange = () => {
  const now = getIndiaNow();
  const dayIndex = now.getDay(); // 0=Sun
  const mondayOffset = (dayIndex + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  return {
    start: monday,
    end: saturday,
    startKey: toDateKey(monday),
    endKey: toDateKey(saturday)
  };
};

const summarizeAssignments = (assignmentsByAbsent) => {
  let total = 0;
  let unassigned = 0;
  const substituteCounts = {};
  Object.values(assignmentsByAbsent || {}).forEach((days) => {
    Object.values(days || {}).forEach((periods) => {
      Object.values(periods || {}).forEach((assignment) => {
        if (!assignment) return;
        total += 1;
        if (assignment.type === "UNASSIGNED") unassigned += 1;
        if (assignment.substitute) {
          const key = assignment.substitute;
          substituteCounts[key] = (substituteCounts[key] || 0) + 1;
        }
      });
    });
  });
  return { total, unassigned, substituteCounts };
};

export default function Reports() {
  const router = useRouter();
  const { school } = router.query;
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const { start, end, startKey, endKey } = useMemo(
    () => getWeekRange(),
    []
  );

  useEffect(() => {
    if (!router.isReady || !school) return;
    const slug = school.toString().toLowerCase();
    const q = query(
      collection(db, "substitution_runs"),
      where("school", "==", slug),
      where("dateKey", ">=", startKey),
      where("dateKey", "<=", endKey),
      orderBy("dateKey", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setRuns(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router.isReady, school, startKey, endKey]);

  const totals = useMemo(() => {
    let totalAbsences = 0;
    let totalSlots = 0;
    let totalUnassigned = 0;
    const substituteTotals = {};
    const daySummary = {};

    runs.forEach((run) => {
      totalAbsences += run.absent?.length || 0;
      const summary = summarizeAssignments(run.assignmentsByAbsent);
      totalSlots += summary.total;
      totalUnassigned += summary.unassigned;

      Object.entries(summary.substituteCounts).forEach(
        ([name, count]) => {
          substituteTotals[name] = (substituteTotals[name] || 0) + count;
        }
      );

      const dayKey = run.dateKey || run.day || "Unknown";
      if (!daySummary[dayKey]) {
        daySummary[dayKey] = {
          absences: 0,
          slots: 0,
          unassigned: 0,
          label: run.day || dayKey
        };
      }
      daySummary[dayKey].absences += run.absent?.length || 0;
      daySummary[dayKey].slots += summary.total;
      daySummary[dayKey].unassigned += summary.unassigned;
    });

    const topSubstitutes = Object.entries(substituteTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const dayRows = Object.entries(daySummary).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return {
      totalAbsences,
      totalSlots,
      totalUnassigned,
      topSubstitutes,
      dayRows
    };
  }, [runs]);

  const schoolName = school?.toString().toUpperCase() || "SCHOOL";

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="page-container system-page">
      <div className="page-shell fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Weekly Reports</p>
            <h1 className="section-title">
              {schoolName} Substitution Summary
            </h1>
            <p className="section-subtitle">
              Coverage analytics for {startKey} to {endKey} (Mon–Sat).
            </p>
          </div>
          <div className="header-actions">
            <span className="chip">
              <span className="status-dot" /> Weekly View
            </span>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Substitution Runs</span>
            <span className="kpi-value">{runs.length}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Total Absences</span>
            <span className="kpi-value">{totals.totalAbsences}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Covered Periods</span>
            <span className="kpi-value">{totals.totalSlots}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Unassigned</span>
            <span className="kpi-value">{totals.totalUnassigned}</span>
          </div>
        </div>

        <div className="report-grid">
          <div className="report-card">
            <h3>Daily Coverage</h3>
            <p className="muted">
              Absences and coverage by date.
            </p>
            {loading && (
              <div className="empty-state">Loading report...</div>
            )}
            {!loading && totals.dayRows.length === 0 && (
              <div className="empty-state">
                No runs found for this week.
              </div>
            )}
            {!loading && totals.dayRows.length > 0 && (
              <div className="table-container">
                <table className="teachers-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Absences</th>
                      <th>Covered</th>
                      <th>Unassigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.dayRows.map(([key, item]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{item.label}</td>
                        <td>{item.absences}</td>
                        <td>{item.slots}</td>
                        <td>{item.unassigned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="report-card">
            <h3>Top Substitutes</h3>
            <p className="muted">
              Teachers covering the most periods this week.
            </p>
            {totals.topSubstitutes.length === 0 && (
              <div className="empty-state">
                No substitutions recorded yet.
              </div>
            )}
            {totals.topSubstitutes.length > 0 && (
              <div className="report-bars">
                {totals.topSubstitutes.map(([name, count]) => (
                  <div key={name} className="bar-row">
                    <span>{name}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${Math.min(100, count * 12)}%`
                        }}
                      />
                    </div>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
