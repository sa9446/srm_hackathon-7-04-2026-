import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, CheckCircle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { scoreApi } from '../services/api';

const PLANS = [
  { plan: 'Premium',  min: 800, coverage: '₹10,00,000', premium: '₹499/month', perks: ['Accident cover', 'Hospitalisation', 'Death benefit', 'Disability cover', 'Third-party liability'], color: '#a78bfa' },
  { plan: 'Standard', min: 600, coverage: '₹5,00,000',  premium: '₹299/month', perks: ['Accident cover', 'Hospitalisation', 'Death benefit'],                                              color: '#22d3ee' },
  { plan: 'Basic',    min: 400, coverage: '₹2,00,000',  premium: '₹149/month', perks: ['Accident cover', 'Hospitalisation'],                                                               color: '#34d399' },
];

const InsurancePage = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    scoreApi.get()
      .then(setData)
      .catch(err => { if (err.message.includes('token')) navigate('/login'); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const score      = data?.score ?? 0;
  const insurance  = data?.insurance ?? {};
  const eligible   = insurance.status === 'Eligible';

  return (
    <div className="app-container">
      <Sidebar active="Insurance" />
      <div className="main-content">
        <TopNavbar />
        <main className="content-padding">
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Insurance Coverage</h2>
          <p style={{ color: '#94a3b8', marginBottom: '28px' }}>Usage-based insurance tied to your Gig Score of <strong style={{ color: 'white' }}>{loading ? '...' : score}</strong> / 1000</p>

          {/* Active plan banner */}
          <div className="glass-panel" style={{
            background: eligible
              ? 'linear-gradient(to right, rgba(22,78,99,0.4), rgba(22,78,99,0.1))'
              : 'linear-gradient(to right, rgba(127,29,29,0.3), rgba(127,29,29,0.1))',
            border: `1px solid ${eligible ? 'rgba(34,211,238,0.3)' : 'rgba(239,68,68,0.3)'}`,
            marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px'
          }}>
            {eligible
              ? <ShieldCheck size={40} style={{ color: '#22d3ee', flexShrink: 0 }} />
              : <ShieldAlert size={40} style={{ color: '#ef4444', flexShrink: 0 }} />}
            <div>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>Your active plan</p>
              <p style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>
                {eligible ? `${insurance.plan} Plan` : 'No Coverage'}
              </p>
              {eligible && (
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                  Coverage up to {insurance.coverage} · {insurance.premium}
                </p>
              )}
              {!eligible && (
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                  Reach a Gig Score of 400+ to unlock insurance.
                </p>
              )}
            </div>
          </div>

          {/* Plan comparison */}
          <h3 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>All Plans</h3>
          <div className="grid-cols-3" style={{ marginBottom: '28px' }}>
            {PLANS.map(p => {
              const unlocked = score >= p.min;
              const current  = insurance.plan === p.plan;
              return (
                <div key={p.plan} className="glass-panel" style={{
                  border: current ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.06)',
                  opacity: unlocked ? 1 : 0.4,
                  display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: p.color, fontWeight: 700, fontSize: '16px' }}>{p.plan}</p>
                    {current && <span style={{ fontSize: '11px', color: p.color, border: `1px solid ${p.color}`, padding: '2px 6px', borderRadius: '999px' }}>Active</span>}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '12px' }}>Score {p.min}+</p>
                  <p style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>{p.coverage}</p>
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>{p.premium}</p>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {p.perks.map(perk => (
                      <li key={perk} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                        <CheckCircle size={14} style={{ color: p.color, flexShrink: 0 }} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {eligible && (
            <button className="btn-primary">
              View Full Policy Details &nbsp;<span style={{ opacity: 0.6, fontSize: '12px' }}>(Coming Soon)</span>
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default InsurancePage;
