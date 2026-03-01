// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Wrap App in Router here
import "./index.css"; // Default CRA styles
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Optional: Import global main styles (already imported in App.js, but okay to have here too)
import "./components/styles/main.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
