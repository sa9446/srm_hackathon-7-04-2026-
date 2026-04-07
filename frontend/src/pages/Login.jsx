import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, KeyRound } from 'lucide-react';
import FaceScanner from '../components/FaceScanner';
import { authApi } from '../services/api';

const PLATFORMS = ['Swiggy', 'Blinkit', 'Uber', 'Ola', 'Rapido', 'Zomato', 'Porter', 'Other'];

export default function Login() {
  // 'choose' | 'face-login' | 'email-login' | 'register' | 'register-face'
  const [screen, setScreen]   = useState('choose');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', password: '', platform: 'Swiggy' });
  const [pendingDescriptor, setPendingDescriptor] = useState(null);
  const navigate = useNavigate();

  const saveAndGo = (res) => {
    localStorage.setItem('gig_token', res.token);
    localStorage.setItem('gig_user',  JSON.stringify(res.user));
    navigate('/dashboard');
  };

  // ── Face login ───────────────────────────────────────────────
  const handleFaceLogin = async (descriptor) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.faceLogin(descriptor);
      saveAndGo(res);
    } catch (err) {
      setError(err.message);
      setScreen('choose');
    } finally {
      setLoading(false);
    }
  };

  // ── Email login ───────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email: form.email, password: form.password });
      saveAndGo(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Register step 1: info ────────────────────────────────────
  const handleRegisterInfo = (e) => {
    e.preventDefault();
    setError('');
    setScreen('register-face');
  };

  // ── Register step 2: face capture ────────────────────────────
  const handleRegisterFace = async (descriptor) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register({ ...form, faceDescriptor: descriptor });
      saveAndGo(res);
    } catch (err) {
      setError(err.message);
      setScreen('register');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipFace = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(form);
      saveAndGo(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: '420px', width: '90%' }}>
        <h1 className="login-title">Gig-Sentry</h1>
        <p className="login-subtitle">Financial Identity for Gig Workers</p>

        {/* ── Choose method ── */}
        {screen === 'choose' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            <button onClick={() => setScreen('face-login')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px' }}>
              <ScanFace size={22} /> Sign In with Face ID
            </button>
            <button onClick={() => setScreen('email-login')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <KeyRound size={18} /> Sign In with Email
            </button>
            <div style={{ textAlign: 'center', color: '#475569', fontSize: '13px', marginTop: '4px' }}>
              No account?{' '}
              <span onClick={() => setScreen('register')} style={{ color: '#34d399', cursor: 'pointer', fontWeight: 600 }}>Register</span>
            </div>
            {error && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
          </div>
        )}

        {/* ── Face login ── */}
        {screen === 'face-login' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>
              Look at the camera. We'll recognise you automatically.
            </p>
            {loading
              ? <p style={{ color: '#34d399' }}>Verifying identity...</p>
              : <FaceScanner onDescriptor={handleFaceLogin} onError={setError} mode="login" autoCapture />
            }
            {error && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
            <button onClick={() => { setError(''); setScreen('choose'); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '13px' }}>
              ← Back
            </button>
          </div>
        )}

        {/* ── Email login ── */}
        {screen === 'email-login' && (
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="form-input" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required className="form-input" />
            {error && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Signing in...' : 'Sign In'}</button>
            <button type="button" onClick={() => { setError(''); setScreen('choose'); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '13px' }}>
              ← Back
            </button>
          </form>
        )}

        {/* ── Register step 1: info ── */}
        {screen === 'register' && (
          <form onSubmit={handleRegisterInfo} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="form-input" />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="form-input" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password (min 6 chars)" required minLength={6} className="form-input" />
            <select name="platform" value={form.platform} onChange={handleChange} className="form-input">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {error && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn-primary">Next: Set up Face ID →</button>
            <button type="button" onClick={() => { setError(''); setScreen('choose'); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '13px' }}>
              ← Back
            </button>
          </form>
        )}

        {/* ── Register step 2: face capture ── */}
        {screen === 'register-face' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>
              Look at the camera to register your face for future logins.
            </p>
            {loading
              ? <p style={{ color: '#34d399' }}>Creating your account...</p>
              : <FaceScanner onDescriptor={handleRegisterFace} onError={setError} mode="register" autoCapture />
            }
            {error && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
            <button onClick={handleSkipFace} disabled={loading} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '13px' }}>
              Skip — register without Face ID
            </button>
          </div>
        )}

        <p style={{ marginTop: '20px', fontSize: '11px', color: '#334155', textAlign: 'center' }}>
          Face data is processed locally and stored only on your account.
        </p>
      </div>
    </div>
  );
}
