import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase/auth";

function Login() {
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.log("LOGIN ERROR:", error);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Travel Companion</h1>
        <p>Discover weather, flights, hotels, and travel insights in one place.</p>
        <button onClick={handleLogin} className="google-btn">
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default Login;