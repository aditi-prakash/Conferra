import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { AuthContext } from "../contexts/AuthContext";

export default function LandingPage() {
  const { isDarkMode, isAuthenticated } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/auth?mode=signup");
    }
  };

  return (
    <div className="landingPageContainer" style={{ filter: isDarkMode ? "none" : "saturate(0.92) brightness(1.05)" }}>
      <nav>
        <div className="navHeader" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <h2>Conferra</h2>
        </div>

        <div className="navlist">
          <p style={{ cursor: "default" }}>Secure Login</p>
          <p>
            <Link to="/auth?mode=signup">Register</Link>
          </p>
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(isAuthenticated ? "/home" : "/auth?mode=signin")}
            onKeyDown={(e) => e.key === "Enter" && navigate(isAuthenticated ? "/home" : "/auth?mode=signin")}
            style={{ cursor: "pointer" }}
          >
            <Link to={isAuthenticated ? "/home" : "/auth?mode=signin"} onClick={(e) => e.preventDefault()}>
              {isAuthenticated ? "Go to Dashboard" : "Login"}
            </Link>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#d97500" }}>Connect</span> with your loved ones
          </h1>

          <p style={{ marginTop: "10px", opacity: 0.9 }}>
            Premium-quality meetings with secure login, instant rooms, scheduling, and chat.
          </p>

          <div
            role="button"
            tabIndex={0}
            onClick={handleGetStarted}
            onKeyDown={(e) => e.key === "Enter" && handleGetStarted()}
            style={{ cursor: "pointer" }}
          >
            <Link to={isAuthenticated ? "/home" : "/auth?mode=signup"} onClick={(e) => e.preventDefault()}>
              {isAuthenticated ? "Launch Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>

        <div>
          <img src="/mobiles.png" alt="video call" />
        </div>
      </div>
    </div>
  );
}

