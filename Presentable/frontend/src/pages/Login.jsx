import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");  // State to store error message
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Reset error message on new login attempt

    axios.post('http://localhost:3000/login', { email, password })
      .then(result => {
        // Checking for success response
        if (result.data === "Success") {
          navigate('/home', { state: { email } }); // Pass email via state
        } else {
          // If the backend sends a message, display it
          setError(result.data.message || "Invalid credentials. Please try again.");
        }
      })
      .catch(err => {
        console.error(err); // Log full error object for debugging
      });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#2d3748",
        color: "#68d391",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
        Log In
      </h2>

      <FaUserPlus size={50} color="#68d391" style={{ marginTop: "1rem", marginBottom: "2rem" }} />

      <form
        onSubmit={handleSubmit}
        style={{
          width: "90%",
          maxWidth: "400px",
          marginTop: "1rem",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#4a5568",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ width: "100%", marginBottom: "1rem" }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#48bb78",
              color: "black",
              borderRadius: "8px",
              border: "none",
            }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ width: "100%", marginBottom: "1rem" }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#48bb78",
              color: "black",
              borderRadius: "8px",
              border: "none",
            }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Show error message if login fails */}
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: "#48bb78",
            color: "black",
            borderRadius: "8px",
            border: "none",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <p style={{ color: "#3182ce" }}>
          Don't have an account?{" "}
          <a href="/signup" style={{ textDecoration: "underline" }}>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
