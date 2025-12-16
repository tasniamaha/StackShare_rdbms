
import { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email, password);
  };

  return (
    <div className="login-page">

      {/* TOP BRANDING */}
      <div className="brand">
        <div className="logo">SS</div>
        <h1>StackShare</h1>
        <p>IUT Social Hub</p>
      </div>

      {/* LOGIN CARD */}
      <div className="login-card">

        {/* TOGGLE */}
        <div className="auth-toggle">
          <button className="active">Login</button>
          <button onClick={() => window.location.href = "/register"}>
            Register
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="IUT Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="forgot">Forgot Password?</div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <div className="or">OR</div>

        <button className="iut-btn">
          Login with IUT Email
        </button>
      </div>
    </div>
  );
}

export default LoginPage;


