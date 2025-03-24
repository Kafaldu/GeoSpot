import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3000/signup', { username, email, password })
      .then(result => {
        console.log(result);
        navigate('/login');
      })
      .catch(err => console.log(err));
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
        Create an Account
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
            type="text"
            name="username"
            placeholder="Username"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#48bb78",
              color: "black",
              borderRadius: "8px",
              border: "none",
            }}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

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
          Sign Up
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <p style={{ color: "#3182ce" }}>
          Already have an account?{" "}
          <a href="/login" style={{ textDecoration: "underline" }}>
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
