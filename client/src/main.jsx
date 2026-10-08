import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import Providers from "./app/providers.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Providers>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Providers>
  </React.StrictMode>,
);