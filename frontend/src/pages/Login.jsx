import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, Loader } from 'lucide-react';
import { authApi } from '../services/api';

const PLATFORMS = ['Swiggy', 'Blinkit', 'Uber', 'Ola', 'Rapido', 'Zomato', 'Porter', 'Other'];

const Login = () => {
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', platform: 'Swiggy' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setScanning(true);

    try {
      const res = mode === 'login'
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.register(form);

      localStorage.setItem('gig_token', res.token);
      localStorage.setItem('gig_user',  JSON.stringify(res.user));
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.message);
      setScanning(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: '400px', width: '90%' }}>
        <h1 className="login-title">Gig-Sentry</h1>
        <p className="login-subtitle">Financial Identity for Gig Workers</p>

        {/* Scan icon — animates on submit */}
        <div className={`scan-area ${scanning ? 'scanning' : ''}`} style={{ pointerEvents: 'none', marginBottom: '24px' }}>
          {loading
            ? <Loader size={48} className="scan-icon" style={{ animation: 'spin 1s linear infinite' }} />
            : <ScanFace size={48} className={`scan-icon ${scanning ? 'scanning' : ''}`} />
          }
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '14px',
                background: mode === m ? '#10b981' : 'rgba(255,255,255,0.08)',
                color: mode === m ? '#fff' : '#94a3b8',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'register' && (
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Full Name" required className="form-input"
            />
          )}
          <input
            name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="Email" required className="form-input"
          />
          <input
            name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="Password" required className="form-input"
          />
          {mode === 'register' && (
            <select name="platform" value={form.platform} onChange={handleChange} className="form-input">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}

          {error && (
            <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="btn-primary"
            style={{ marginTop: '4px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Verifying...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '12px', color: '#475569', textAlign: 'center' }}>
          Supported platforms: Swiggy · Blinkit · Uber · Ola · Rapido
        </p>
      </div>
    </div>
  );
};

export default Login;
