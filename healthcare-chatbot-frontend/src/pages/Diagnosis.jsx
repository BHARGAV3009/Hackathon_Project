import React, { useState } from "react";
import "./Diagnosis.css";

// Simple Diagnosis page that calls backend /api/diagnosis
export default function Diagnosis() {
  const [bp, setBp] = useState(120);
  const [sugar, setSugar] = useState(90);
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const form = new FormData();
      form.append("vitals", JSON.stringify({ bp, sugar, age, weight }));
      if (text) form.append("text", text);
      if (file) form.append("image", file);

      const clientUser = JSON.parse(localStorage.getItem('hc_user') || 'null');
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'}/api/diagnosis`, {
        method: "POST",
        headers: {
          // Include identity context + JWT if available
          'x-user-id': clientUser?.id || '',
          'x-user-email': clientUser?.email || '',
          ...(clientUser?.token ? { 'Authorization': `Bearer ${clientUser.token}` } : {}),
        },
        body: form,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Diagnosis failed");
      setResult(data.result);
    } catch (err) {
      setError(err.message || "Failed to fetch diagnosis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diagnosis-page">
      <h1 className="diagnosis-title">AI Diagnosis</h1>
      <form onSubmit={onSubmit} className="diagnosis-form">
        <div>
          <label>BP: </label>
          <input type="number" value={bp} onChange={(e) => setBp(Number(e.target.value))} />
        </div>
        <div>
          <label>Sugar: </label>
          <input type="number" value={sugar} onChange={(e) => setSugar(Number(e.target.value))} />
        </div>
        <div>
          <label>Age: </label>
          <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
        </div>
        <div>
          <label>Weight: </label>
          <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
        </div>
        <div>
          <label>Optional text: </label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe symptoms or context" />
        </div>
        <div>
          <label>Optional image: </label>
          <input type="file" accept="image/*" className="diagnosis-image-input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Running...' : 'Run Diagnosis'}</button>
      </form>

      {error && <p className="diagnosis-error">{error}</p>}

      {result && (
        <div className="diagnosis-result">
          <div><strong>Diagnosis:</strong> {result.diagnosis}</div>
          {typeof result.confidence === 'number' && (
            <div><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</div>
          )}
          {result.notes && <div style={{ marginTop: 8 }}><strong>Notes:</strong> {result.notes}</div>}
        </div>
      )}
    </div>
  );
}