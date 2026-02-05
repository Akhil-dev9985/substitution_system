import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const VITALIS_UID = "3VrwMgWEDoQekvqmXZGWJ4E7AFV2";
const VITALIS_EMAIL = "admin@vitallisschools.com";
const ADMIN_UID = "q17KO96ZiGa3PVQVcePjKlbXLED2";
const ADMIN_EMAIL = "user@test.com";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;

      let userData = null;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userData = userSnap.data();
      }

      const isAdmin =
        userData?.role === "admin" || userData?.isAdmin === true;
      const schoolSlug =
        userData?.schoolSlug ||
        userData?.school ||
        userData?.allowedSystems?.[0];

      const userEmail = user.email?.toLowerCase();
      if (user.uid === ADMIN_UID || userEmail === ADMIN_EMAIL) {
        router.push("/dashboard");
      } else if (
        user.uid === VITALIS_UID ||
        userEmail === VITALIS_EMAIL
      ) {
        router.push("/systems/vitalis");
      } else if (isAdmin) {
        router.push("/dashboard");
      } else if (schoolSlug) {
        router.push(`/systems/${schoolSlug}`);
      } else {
        setError("Access not authorized for this account.");
      }
    } catch (err) {
      const code = err?.code || "auth/unknown";
      const message =
        err?.message || "Login failed. Please try again.";
      setError(`${message} (${code})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-left fade-in">
          <div className="brand">
            <span className="brand-dot" />
            <div>
              <h1 className="brand-title">Substitution OS</h1>
              <p className="brand-subtitle">
                A unified command layer for school staffing.
              </p>
            </div>
          </div>

          <p className="auth-intro">
            Keep schedules resilient with fast substitution planning,
            real-time teacher visibility, and streamlined approvals.
          </p>

          <div className="highlight-grid">
            <div className="highlight-card">
              <h4>Live Coverage</h4>
              <p>Track availability, weekly loads, and conflicts.</p>
            </div>
            <div className="highlight-card">
              <h4>Admin Control</h4>
              <p>Manage systems across schools from one place.</p>
            </div>
            <div className="highlight-card">
              <h4>Audit Ready</h4>
              <p>Capture every change with structured records.</p>
            </div>
          </div>
        </div>

        <div className="auth-right fade-in">
          <div className="auth-card">
            <span className="auth-badge">Secure Access</span>
            <h2>School Login Portal</h2>
            <p>
              Admin accounts route to the systems dashboard. School
              accounts go directly to their substitution workspace.
            </p>

            <form onSubmit={handleLogin} className="auth-form">
              <label className="field">
                Email
                <input
                  type="email"
                  placeholder="school@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="field">
                Password
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {error && <span className="error">{error}</span>}

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="auth-note">
              Use your official school email. If you need admin access,
              request access via leadership ops.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
