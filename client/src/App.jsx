import { useState } from "react";
import LoginForm from "./components/LoginForm";
import KanbanBoard from "./components/KanbanBoard";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <KanbanBoard token={token} onLogout={handleLogout} />;
}

export default App;
