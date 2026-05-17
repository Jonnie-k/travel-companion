import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page center">
      <h1>Travel Companion Dashboard</h1>

      <p>
        Plan and manage your trips with live travel data.
      </p>

      <div className="button-group">
        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}
export default Home;