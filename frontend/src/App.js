import React from "react";
import BorrowerDashboard from "./BorrowerDashboard";
import OwnerDashboard from "./OwnerDashboard";
import "./App.css";
import "./BorrowerDashboard.css";

function App() {
  const role = "owner"; // change to "borrower"

  return (
    <div className="App">
      {role === "owner" ? <OwnerDashboard /> : <BorrowerDashboard />}
    </div>
  );
}

export default App;
