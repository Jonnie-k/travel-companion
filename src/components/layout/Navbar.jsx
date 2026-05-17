import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { logout, currentUser } = useAuth();

  return (
    <nav className="navbar">
      <h1>Travel Companion</h1>
    <h2>Plan your trips with Travel companion </h2>

      <div className="nav-links">
        <Link to="/search">Search</Link>
        <Link to="/dashboard">Dashboard</Link>

        {currentUser && (
          <button onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;