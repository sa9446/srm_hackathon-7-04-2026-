import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, RefreshCw } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { authApi, scoreApi } from '../services/api';

const PLATFORMS = ['Swiggy', 'Blinkit', 'Uber', 'Ola', 'Rapido', 'Zomato', 'Porter', 'Other'];

const SettingsPage = () => {
  const [profile, setProfile]       = useState(null);
  const [scoreData, setScoreData]   = useState(null);
  const [recomputing, setRecomputing] = useState(false);
  const [msg, setMsg]               = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([authApi.profile(), scoreApi.get()])
      .then(([p, s]) => { setProfile(p); setScoreData(s); })
      .catch(err => { if (err.message.includes('token')) navigate('/login'); });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('gig_token');
    localStorage.removeItem('gig_user');
    navigate('/login');
  };

  const handleRecompute = async () => {
    setRecomputing(true);
    setMsg('');
    try {
      const res = await scoreApi.recompute();
      setScoreData(prev => ({ ...prev, score: res.score }));
      setMsg(`Score recomputed: ${res.score} / 1000`);
    } catch (err) {
      setMsg('Failed: ' + err.message);
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar active="Settings" />
      <div className="main-content">
        <TopNavbar />
        <main className="content-padding">
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '28px' }}>Settings</h2>

          {/* Profile */}
          <div className="glass-panel" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>{profile?.name ?? '...'}</p>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>{profile?.email}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Platform', value: profile?.platform },
                { label: 'Phone',    value: profile?.phone || '—' },
                { label: 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                { label: 'Gig Score', value: scoreData ? `${scoreData.score} / 1000` : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
                  <p style={{ color: 'white', fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Score breakdown */}
          {scoreData?.breakdown && (
            <div className="glass-panel" style={{ marginBottom: '20px' }}>
              <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '16px' }}>Score Breakdown</h3>
              {Object.entries(scoreData.breakdown).map(([key, v]) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{v.label}</span>
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{v.score} / {v.max}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '6px' }}>
                    <div style={{
                      width: `${(v.score / v.max) * 100}%`,
                      height: '100%', borderRadius: '999px',
                      background: 'linear-gradient(to right,#10b981,#0ea5e9)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>Actions</h3>

            <button onClick={handleRecompute} disabled={recomputing} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <RefreshCw size={16} style={{ animation: recomputing ? 'spin 1s linear infinite' : 'none' }} />
              {recomputing ? 'Recomputing...' : 'Recompute Gig Score'}
            </button>

            {msg && <p style={{ color: '#34d399', fontSize: '13px', textAlign: 'center' }}>{msg}</p>}

            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
