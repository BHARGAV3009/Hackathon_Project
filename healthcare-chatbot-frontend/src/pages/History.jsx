import React, { useEffect, useState } from 'react';

export default function History() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('hc_user') || 'null');
    if (!user?.token) {
      setError('Please login again');
      return;
    }

    const base = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';
    const headers = { Authorization: `Bearer ${user.token}` };

    // Fetch in parallel
    Promise.all([
      fetch(`${base}/api/diagnosis`, { headers }).then(r => r.json()),
      fetch(`${base}/api/upload`, { headers }).then(r => r.json()),
      fetch(`${base}/api/chat`, { headers }).then(r => r.json()),
    ]).then(([d, u, c]) => {
      if (!d.ok) throw new Error(d.error || 'Failed to load diagnoses');
      if (!u.ok) throw new Error(u.error || 'Failed to load uploads');
      if (!c.ok) throw new Error(c.error || 'Failed to load chat');
      setDiagnoses(d.items || []);
      setUploads(u.items || []);
      setChatMessages(c.messages || []);
    }).catch((err) => setError(err.message || 'Failed to load history'));
  }, []);

  if (error) return <div style={{ padding: 24, color: 'crimson' }}>{error}</div>;

  return (
    <div style={{ padding: 24, display: 'grid', gap: 24 }}>
      <section>
        <h2 style={{ marginBottom: 8 }}>My Diagnoses</h2>
        {diagnoses.length === 0 ? (
          <div>No diagnoses yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {diagnoses.map((d) => (
              <div key={d._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 600 }}>{d.result?.diagnosis || 'Unknown'}</div>
                <div style={{ fontSize: 14, color: '#666' }}>{d.result?.notes}</div>
                {d.imagePath && (
                  <img src={`${(import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000')}/${d.imagePath.replace('\\', '/')}`} alt="upload" style={{ maxWidth: 240, marginTop: 8 }} />
                )}
                <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{new Date(d.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>My Uploads</h2>
        {uploads.length === 0 ? (
          <div>No uploads yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {uploads.map((u) => (
              <div key={u._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={`${(import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000')}${u.fileUrl}`} alt="upload" style={{ width: 120, height: 'auto', borderRadius: 8 }} />
                  <div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{u.description}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{new Date(u.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>My Chat</h2>
        {chatMessages.length === 0 ? (
          <div>No messages yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                <div style={{ fontWeight: 600, minWidth: 50, color: m.sender === 'user' ? '#2563eb' : '#16a34a' }}>
                  {m.sender}
                </div>
                <div style={{ flex: 1 }}>{m.text}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{new Date(m.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}