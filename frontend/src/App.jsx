import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  if (!token) {
    return showRegister ? (
      <Register 
        onRegisterSuccess={() => setShowRegister(false)}
        onUserExists={() => setShowRegister(false)}
      />
    ) : (
      <Login onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
    );
  }

  return <Home user={user} onLogout={handleLogout} />;
}

export default App;