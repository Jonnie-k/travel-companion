import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>Travel Companion</h2>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        {currentUser && (
          <button onClick={handleSignOut} className="signout-btn">
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
