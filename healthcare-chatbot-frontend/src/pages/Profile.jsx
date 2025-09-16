import React, { useState } from 'react';

export default function Profile({ user, setUser }) {
  const [email, setEmail] = useState(user?.email || "");

  const save = () => {
    const next = { ...(user || {}), email };
    localStorage.setItem('hc_user', JSON.stringify(next));
    setUser?.(next);
    alert('Profile updated');
  };

  return (
    <div style={{ paddingTop: 72, maxWidth: 720, margin: '0 auto', paddingInline: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Profile</h1>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <label style={{ display: 'block', fontSize: 14, color: '#374151', marginBottom: 6 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={save} style={{ background: '#111827', color: '#fff', borderRadius: 8, padding: '8px 12px', border: 'none' }}>Save</button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Session</h2>
        <p style={{ color: '#4b5563', fontSize: 14 }}>You are signed in as <b>{user?.email}</b>.</p>
      </div>
    </div>
  );
}