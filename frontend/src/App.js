import React from "react";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./context/AuthContext"; 
//app part
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
