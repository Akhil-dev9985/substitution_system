import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const ADMIN_UID = "q17KO96ZiGa3PVQVcePjKlbXLED2";
const ADMIN_EMAIL = "user@test.com";

export default function Dashboard() {
  const [systems, setSystems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      // Fetch logged-in user data
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const userData = userSnap.exists() ? userSnap.data() : {};
      const isAdmin =
        userData?.role === "admin" || userData?.isAdmin === true;
      const schoolSlug =
        userData?.schoolSlug ||
        userData?.school ||
        userData?.allowedSystems?.[0];

      const isAdminEmail =
        user.email?.toLowerCase() === ADMIN_EMAIL;
      const isAdminUid = user.uid === ADMIN_UID;
      const isSuperAdmin = isAdmin || isAdminEmail || isAdminUid;

      setUserProfile({
        email: user.email,
        ...userData,
        isAdmin,
        isSuperAdmin
      });

      if (!isSuperAdmin) {
        router.replace("/");
        return;
      }

      // Fetch all systems
      const systemsRef = collection(db, "systems");
      const systemsSnap = await getDocs(systemsRef);

      const allSystems = systemsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      const visibleSystems = isAdmin
        ? allSystems
        : allSystems.filter((system) =>
            userData.allowedSystems?.includes(system.slug)
          );

      setSystems(visibleSystems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userProfile?.isSuperAdmin) return;
    const q = query(
      collection(db, "access_requests"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setRequests(list);
    });
    return () => unsubscribe();
  }, [userProfile?.isSuperAdmin]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const searchLower = search.trim().toLowerCase();
  const filteredSystems = systems.filter((system) => {
    if (!searchLower) return true;
    return (
      system.name?.toLowerCase().includes(searchLower) ||
      system.slug?.toLowerCase().includes(searchLower)
    );
  });

  const pendingRequests = useMemo(
    () => requests.filter((req) => req.status === "pending"),
    [requests]
  );

  const toggleSystemReady = async (system) => {
    if (!userProfile?.isSuperAdmin) return;
    const ref = doc(db, "systems", system.id);
    const nextReady = !(system.ready ?? true);
    setSystems((prev) =>
      prev.map((item) =>
        item.id === system.id ? { ...item, ready: nextReady } : item
      )
    );
    try {
      await updateDoc(ref, { ready: nextReady });
    } catch (error) {
      setSystems((prev) =>
        prev.map((item) =>
          item.id === system.id ? { ...item, ready: system.ready } : item
        )
      );
    }
  };

  const clearRequests = async () => {
    if (!userProfile?.isSuperAdmin) return;
    await Promise.all(
      pendingRequests.map((req) =>
        deleteDoc(doc(db, "access_requests", req.id))
      )
    );
  };

  return (
    <div className="page-container dashboard-page">
      <div className="page-shell fade-in">
        <header className="page-header">
          <div className="brand">
            <span className="brand-dot" />
            <div>
              <p className="eyebrow">
                {userProfile?.isAdmin ? "Admin Console" : "Systems Console"}
              </p>
              <h1 className="brand-title">Systems Control Center</h1>
              <p className="brand-subtitle">
                Monitor substitution systems across campuses.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <span className="chip">
              <span className="status-dot" />
              {userProfile?.isAdmin ? "Admin Access" : "School Access"}
            </span>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-hero">
          <div>
            <h2 className="section-title">Live Systems View</h2>
            <p className="section-subtitle">
              Track available substitution systems, assign access, and
              keep coverage running without delays.
            </p>
          </div>

          <div className="dashboard-actions">
            <div className="search-field">
              <span className="mono">Search</span>
              <input
                type="text"
                placeholder="Find by school or slug"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost" type="button">
              Access Protocols
            </button>
          </div>
        </section>

        <section className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Assigned Systems</span>
            <span className="kpi-value">{systems.length}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Access Profile</span>
            <span className="kpi-value">
              {userProfile?.isAdmin ? "Admin" : "School"}
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Operator</span>
            <span className="kpi-value mono">
              {userProfile?.email || "Active Session"}
            </span>
          </div>
        </section>

        <div className="divider" />

        <section>
          <h3 className="section-title">Active Systems</h3>
          <p className="section-subtitle">
            Select a school system to manage staffing, substitutions,
            and visibility.
          </p>

          {loading && (
            <div className="empty-state">Loading systems...</div>
          )}

          {!loading && filteredSystems.length === 0 && (
            <div className="empty-state">
              No systems assigned yet.
            </div>
          )}

          <div className="system-grid">
            {filteredSystems.map((system) => (
              <div
                key={system.slug}
                className="system-card"
                onClick={(event) => {
                  if (
                    event.target.closest(".system-toggle")
                  ) {
                    return;
                  }
                  router.push(`/systems/${system.slug}`);
                }}
              >
                <h3>{system.name}</h3>
                <p className="muted">
                  School: {system.name || system.slug}
                </p>
                <p>Access the {system.name} substitution workspace.</p>
                <div className="system-actions">
                  <span className="chip">
                    {system.ready === false
                      ? "System Off"
                      : "System Ready"}
                  </span>
                  {userProfile?.isSuperAdmin && (
                    <button
                      className="btn btn-ghost system-toggle"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSystemReady(system);
                      }}
                    >
                      {system.ready === false ? "Turn On" : "Turn Off"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {userProfile?.isSuperAdmin && (
        <>
          <button
            className="notify-fab"
            type="button"
            onClick={() =>
              setNotificationsOpen((prev) => !prev)
            }
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="notify-count">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <aside
            className={`notify-sidebar ${
              notificationsOpen ? "open" : ""
            }`}
          >
            <div className="notify-header">
              <h4>Access Requests</h4>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={clearRequests}
                disabled={pendingRequests.length === 0}
              >
                Clear
              </button>
            </div>
            <div className="notify-list">
              {pendingRequests.length === 0 && (
                <div className="empty-state">
                  No pending requests.
                </div>
              )}
              {pendingRequests.map((req) => (
                <div key={req.id} className="notify-card">
                  <div>
                    <strong>{req.type || "Request"}</strong>
                    <p className="muted">
                      {req.requesterEmail || "Unknown requester"}
                    </p>
                  </div>
                  <span className="tag">
                    {req.school?.toString().toUpperCase() ||
                      "SCHOOL"}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
