import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import KanbanBoard from "./components/KanbanBoard";
import CvManager from "./pages/CvManager";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleAuthenticated = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute token={token} />}>
          <Route
            path="/login"
            element={<LoginForm onLogin={handleAuthenticated} />}
          />
          <Route
            path="/register"
            element={<RegisterForm onRegister={handleAuthenticated} />}
          />
        </Route>

        <Route element={<ProtectedRoute token={token} />}>
          <Route
            element={
              <Layout token={token} user={user} onLogout={handleLogout} />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/board" element={<KanbanBoard />} />
            <Route path="/cvs" element={<CvManager />} />
          </Route>
        </Route>

        <Route
          path="/"
          element={<Navigate to={token ? "/board" : "/login"} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={token ? "/board" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
