import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('hc_user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="container-header">
      <div className="header-left">
        <Link to="/" className="heading">HealthBot</Link>
      </div>

      <div className="header-right">
        {user && <span className="user-email">{user.email}</span>}

        {user && <button onClick={logout} className="logout-btn">Logout</button>}
        {!user && (
          <>
            <Link className="login-btn" to="/login">Login</Link>
            <Link className="signup-btn" to="/signup">Signup</Link>
          </>
        )}
      </div>
    </header>
  );
}
