// src/Login.jsx
import React from "react";

const Login = () => {
  const handleGithubLogin = () => {
    // Redirect to backend GitHub OAuth route
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <div style={styles.container}>
      <h1>SkillHire Login</h1>
      <button style={styles.button} onClick={handleGithubLogin}>
        Login with GitHub
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#24292f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Login;
