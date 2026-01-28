// src/components/auth/Register.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { saveAuth } from "../utils/authStorage";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    student_id: "",
    student_name: "",
    student_email: "",
    student_dept: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -------- Client-side validation (matches backend expectations)
  const validate = () => {
    if (!form.student_id.trim()) return "Student ID is required";
    if (!form.student_name.trim()) return "Student name is required";
    if (!form.student_email.trim()) return "Student email is required";
    if (!/\S+@\S+\.\S+/.test(form.student_email))
      return "Invalid email format";
    if (!form.student_dept.trim()) return "Department is required";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters";

    return null;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Register
      await apiClient.post("/auth/register", form);

      // 2️⃣ Auto-login immediately after successful registration
      const loginRes = await apiClient.post("/auth/login", {
        student_email: form.student_email,
        password: form.password,
      });

      // 3️⃣ Store token + user using authStorage
      saveAuth(loginRes.data.token, loginRes.data.user);

      // 4️⃣ Redirect to dashboard based on role
      if (loginRes.data.user.role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/borrower/dashboard");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="student_id"
          placeholder="Student ID"
          value={form.student_id}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="student_name"
          placeholder="Full Name"
          value={form.student_name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="student_email"
          placeholder="Email"
          value={form.student_email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="student_dept"
          placeholder="Department"
          value={form.student_dept}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min 6 chars)"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
