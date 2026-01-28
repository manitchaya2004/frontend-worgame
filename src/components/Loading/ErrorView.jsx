import React from "react";

const ErrorView = ({ error, onRetry }) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#1a0505",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#ff4d4d",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️ ERROR</h1>

      <p
        style={{
          fontSize: "1.2rem",
          marginBottom: "2rem",
          maxWidth: "80%",
          textAlign: "center",
        }}
      >
        {error}
      </p>

      <button
        onClick={onRetry}
        style={{
          padding: "10px 20px",
          fontSize: "1.2rem",
          background: "#ff4d4d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        RETRY
      </button>
    </div>
  );
};

export default ErrorView;
