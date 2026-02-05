import { useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";

const VITALIS_UID = "3VrwMgWEDoQekvqmXZGWJ4E7AFV2";
const VITALIS_EMAIL = "admin@vitallisschools.com";
const ADMIN_UID = "q17KO96ZiGa3PVQVcePjKlbXLED2";
const ADMIN_EMAIL = "user@test.com";

export default function SchoolSystem() {
  const router = useRouter();
  const { school } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
        return;
      }
      const email = user.email?.toLowerCase();
      if (user.uid === ADMIN_UID || email === ADMIN_EMAIL) return;
      const schoolSlug = school?.toString().toLowerCase();
      if (user.uid === VITALIS_UID || email === VITALIS_EMAIL) {
        if (schoolSlug !== "vitalis") {
          router.replace("/systems/vitalis");
        }
        return;
      }
    });
    return () => unsubscribe();
  }, [router, school]);

  if (!router.isReady) return null;

  const schoolName = school?.toString().toUpperCase() || "SCHOOL";
  const modules = [
    {
      title: "Teachers",
      description: "View, onboard, and manage staff profiles.",
      path: `/systems/${school}/teachers`,
      status: "Live"
    },
    {
      title: "Substitutions",
      description: "Plan coverage, approvals, and assignments.",
      path: `/systems/${school}/substitution`,
      status: "Live"
    },
    {
      title: "Timetables",
      description: "Sync schedules and automated allocations.",
      path: `/systems/${school}/timetables`,
      status: "Live"
    },
    {
      title: "Reports",
      description: "Generate weekly and monthly insights.",
      path: `/systems/${school}/reports`,
      status: "Live"
    }
  ];

  return (
    <div className="page-container system-page">
      <div className="page-shell fade-in">
        <section className="system-hero">
          <div>
            <p className="eyebrow">School System</p>
            <h1 className="section-title">
              {schoolName} Substitution Suite
            </h1>
            <p className="section-subtitle">
              Orchestrate coverage, teacher load, and approvals from a
              single command workspace.
            </p>
          </div>

          <div className="hero-panel">
            <div className="stat-row">
              <span>System Status</span>
              <strong>Operational</strong>
            </div>
            <div className="stat-row">
              <span>Active Modules</span>
              <strong>3 Live</strong>
            </div>
            <div className="stat-row">
              <span>Queued Modules</span>
              <strong>1 Upcoming</strong>
            </div>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => router.push(`/systems/${school}/substitution`)}
            >
              Open Substitutions
            </button>
          </div>
        </section>

        <div className="divider" />

        <section>
          <h2 className="section-title">Core Modules</h2>
          <p className="section-subtitle">
            Select a module to continue managing the substitution
            workflow for {schoolName}.
          </p>

          <div className="module-grid">
            {modules.map((module) => (
              <div
                key={module.title}
                className={`module-card ${
                  module.path ? "" : "disabled"
                }`}
                onClick={() =>
                  module.path ? router.push(module.path) : null
                }
              >
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span className="status-dot" />
                  <span>{module.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
