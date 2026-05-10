import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { AuthContext } from "../contexts/AuthContext";

export default function LandingPage() {
  const { isDarkMode } = React.useContext(AuthContext);
  return (
    <div className="landingPageContainer" style={{ filter: isDarkMode ? "none" : "saturate(0.92) brightness(1.05)" }}>
      <nav>
        <div className="navHeader">
          <h2>Conferra</h2>
        </div>

        <div className="navlist">
          <p>Secure Login</p>
          <p>
            <Link to="/auth?mode=signup">Register</Link>
          </p>
          <div role="button">
            <Link to="/auth?mode=signin">Login</Link>
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

          <div role="button">
            <Link to="/auth">Get Started</Link>
          </div>
        </div>

        <div>
          <img src="/mobiles.png" alt="video call" />
        </div>
      </div>
    </div>
  );
}
