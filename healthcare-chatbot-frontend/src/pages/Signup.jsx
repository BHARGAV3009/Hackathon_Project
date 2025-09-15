import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';
import google from "../assets/google.jpg";
import microsoft from "../assets/microsoft.png";
import phone from "../assets/phone.jpeg";


export default function Signup({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      return setError('Please fill all fields');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    const newUser = { id: `${Date.now()}`, email };
    localStorage.setItem('hc_user', JSON.stringify(newUser));
    setUser(newUser);
    navigate('/chat');
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h1 className="title">Create account</h1>
        <p className="subtitle">Start chatting with HealthBot in seconds.</p>

        <form onSubmit={onSubmit} className="form">
          <div className="form-group">
            <label>Email address</label><br/>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label><br/>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label><br/>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="continue-btn">Continue</button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-buttons">
          <button className="btn-secondary"><span><img src={google} style={{width:'25px', marginRight:'8px'}}/></span>Continue with Google</button>
          <button className="btn-secondary"><span><img src={phone} style={{width:'20px', marginRight:'8px'}}/></span>Continue with phone</button>
        </div>

        <p className="login-link">
          Already have an account? <Link id="link" to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
