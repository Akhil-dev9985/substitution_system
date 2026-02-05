import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where
} from "firebase/firestore";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";

const ADMIN_UID = "q17KO96ZiGa3PVQVcePjKlbXLED2";
const ADMIN_EMAIL = "user@test.com";

export default function Teachers() {
  const router = useRouter();
  const { school } = router.query;
  const [teachers, setTeachers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [requestStatus, setRequestStatus] = useState("idle");
  const [systemReady, setSystemReady] = useState(true);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [subject, setSubject] = useState("");
  const [weekly, setWeekly] = useState("");

  /* 🔁 LIVE FETCH FROM FIREBASE */
  useEffect(() => {
    if (!router.isReady || !school) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      const email = user?.email?.toLowerCase();
      setIsAdminUser(
        user?.uid === ADMIN_UID || email === ADMIN_EMAIL
      );
    });
    const q = query(
      collection(db, "teachers"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filtered = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((teacher) => teacher.school === school);

      const list = filtered.map((teacher, index) => ({
        ...teacher,
        sno: index + 1
      }));
      setTeachers(list);
    });

    const schoolSlug = school?.toString().toLowerCase();
    const systemQuery = query(
      collection(db, "systems"),
      where("slug", "==", schoolSlug)
    );
    const unsubscribeSystems = onSnapshot(
      systemQuery,
      (snapshot) => {
        const docSnap = snapshot.docs[0];
        if (!docSnap) return;
        const data = docSnap.data() || {};
        setSystemReady(data.ready !== false);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeAuth();
      unsubscribeSystems();
    };
  }, [router.isReady, school]);

  /* ➕ ADD TEACHER */
  const addTeacher = async () => {
    const canAddTeacher = isAdminUser || systemReady;
    if (!canAddTeacher) return;
    if (!name || !code || !subject || !weekly || !school) return;

    await addDoc(collection(db, "teachers"), {
      name: name.replace(/\s+/g, "").toUpperCase(),
      code: code.replace(/\s+/g, "").toUpperCase(),
      subject: subject.replace(/\s+/g, "").toUpperCase(),
      weeklyClasses: Number(weekly),
      school,
      createdAt: serverTimestamp()
    });

    setName("");
    setCode("");
    setSubject("");
    setWeekly("");
  };

  /* ❌ DELETE TEACHER (ADMIN ONLY — ENABLE LATER) */
  const deleteTeacher = async (id) => {
    await deleteDoc(doc(db, "teachers", id));
  };

  const requestAdminAccess = async () => {
    if (!currentUser || !school) return;
    setRequestStatus("sending");
    try {
      await addDoc(collection(db, "access_requests"), {
        type: "add_teacher",
        school,
        systemReady,
        requesterUid: currentUser.uid,
        requesterEmail: currentUser.email || "",
        status: "pending",
        createdAt: serverTimestamp()
      });
      setRequestStatus("sent");
    } catch (error) {
      setRequestStatus("error");
    }
  };

  if (!router.isReady) return null;
  const schoolName = school?.toString().toUpperCase() || "SCHOOL";
  const canAddTeacher = isAdminUser || systemReady;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="page-container system-page">
      <div className="page-shell fade-in">
        <header className="page-header">
          <div>
            <p className="eyebrow">Teachers Module</p>
            <h1 className="section-title">
              {schoolName} Staff Directory
            </h1>
            <p className="section-subtitle">
              Add and monitor teaching staff details for substitution
              planning.
            </p>
          </div>
          <div className="header-actions">
            <span className="chip">
              <span className="status-dot" /> Live Sync
            </span>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="teacher-layout">
          <div className="teacher-form-card">
            <h3>Add Teacher</h3>
            <p className="muted">
              Capture verified teacher details and weekly workload.
            </p>

            <div className="teacher-form">
              <label className="field">
                Full Name
                <input
                  placeholder="Teacher Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canAddTeacher}
                />
              </label>

              <label className="field">
                Teacher Code
                <input
                  placeholder="Teacher Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!canAddTeacher}
                />
              </label>

              <label className="field">
                Subject
                <input
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={!canAddTeacher}
                />
              </label>

              <label className="field">
                Weekly Classes
                <input
                  type="number"
                  placeholder="Weekly Classes"
                  value={weekly}
                  onChange={(e) => setWeekly(e.target.value)}
                  disabled={!canAddTeacher}
                />
              </label>

              {canAddTeacher ? (
                <button
                  className="btn btn-primary"
                  onClick={addTeacher}
                >
                  Add Teacher
                </button>
              ) : (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={requestAdminAccess}
                  disabled={requestStatus === "sending"}
                >
                  {requestStatus === "sent"
                    ? "Request Sent"
                    : requestStatus === "error"
                    ? "Request Failed"
                    : "Ask Admin to Authorize"}
                </button>
              )}
            </div>
          </div>

          <div className="teacher-table-card">
            <div className="page-header">
              <div>
                <h3 className="section-title">Active Teachers</h3>
                <p className="section-subtitle">
                  {teachers.length} records in {schoolName}
                </p>
              </div>
              <span className="tag">{teachers.length} Live</span>
            </div>

            <div className="table-container">
              <table className="teachers-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Subject</th>
                    <th>Weekly Classes</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id}>
                      <td>{t.sno}</td>
                      <td>{t.name}</td>
                      <td>{t.code}</td>
                      <td>{t.subject}</td>
                      <td>{t.weeklyClasses}</td>
                      <td className="muted">Admin only</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {teachers.length === 0 && (
              <div className="empty-state">
                No teachers added yet. Add your first record to start
                tracking coverage.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
