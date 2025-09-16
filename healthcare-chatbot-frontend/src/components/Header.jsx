import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ user, setUser, onNewChat }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const logout = () => {
    localStorage.removeItem('hc_user');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="container-header">
      <div className="header-left">
        <Link to="/" className="heading">HealthBot</Link>
      </div>

      <div className="header-right">
        {user && (
          <button className="newchat-top-btn" onClick={onNewChat} title="New chat">+ New chat</button>
        )}

        {!user && (
          <>
            <Link className="login-btn" to="/login">Login</Link>
            <Link className="signup-btn" to="/signup">Signup</Link>
          </>
        )}

        {user && (
          <div className="profile-menu" ref={menuRef}>
            <button className="avatar-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Open profile menu">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </button>
            {menuOpen && (
              <div className="menu-dropdown">
                <div className="menu-header">
                  <div className="menu-email">{user.email}</div>
                </div>
                <button className="menu-item" onClick={() => { setMenuOpen(false); navigate('/profile'); }}>Profile</button>
                <button className="menu-item" onClick={() => { setMenuOpen(false); navigate('/'); }}>Home</button>
                <button className="menu-item" onClick={() => { setMenuOpen(false); navigate('/history'); }}>History</button>
                <hr className="menu-sep"/>
                <button className="menu-item danger" onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
