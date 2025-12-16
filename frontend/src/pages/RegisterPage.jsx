import { useState } from "react";
import "./LoginPage.css"; // reuse same styles

function RegisterPage() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // For now: frontend only
    console.log("Name:", name);
    console.log("Student ID:", studentId);
    console.log("Email:", email);
    console.log("Password:", password);

    setMessage("Account created successfully!");
  };

  return (
    <div className="login-page">
      {/* Top Logo Section */}
      <div className="logo-section">
        <div className="logo">SS</div>
        <h1>StackShare</h1>
        <p>IUT Social Hub</p>
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Tabs */}
        <div className="tab-buttons">
          <button className="tab inactive">Login</button>
          <button className="tab active">Register</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Student ID (e.g. 2023-XXX)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />

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

          <button type="submit" className="login-btn">
            Create Account
          </button>

          {message && <p className="login-message">{message}</p>}
        </form>

        <div className="or">OR</div>

        <button
          className="iut-btn"
          onClick={() => alert("Register with IUT Email clicked")}
        >
          Register with IUT Email
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
