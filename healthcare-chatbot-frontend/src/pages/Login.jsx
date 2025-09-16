import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import google from '../assets/google.jpg';
import phone from '../assets/phone.jpeg';


export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter email and password');
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Login failed');
      const userDoc = data.user; // { _id, email, name }
      const newUser = { id: userDoc._id, email: userDoc.email, name: userDoc.name };
      localStorage.setItem('hc_user', JSON.stringify(newUser));
      setUser(newUser);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Log in or sign up</h1>
        <p className="subtitle">
          You'll get smarter responses and can upload files, images, and more.
        </p>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary-btn">Continue</button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-buttons">
          <button><span><img src={google} alt="" style={{width:'20px', marginRight:'8px'}}/></span>Continue with Google</button>
          <button><span><img src={phone} alt="" style={{width:'20px', marginRight:'8px'}}/></span>Continue with phone</button>
        </div>

        <p className="signup-text">
          No account? <Link id='link' to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
