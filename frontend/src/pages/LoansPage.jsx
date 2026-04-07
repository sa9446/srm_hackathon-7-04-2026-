import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, CheckCircle, XCircle, ArrowRight, TrendingUp } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { scoreApi } from '../services/api';

const TIERS = [
  { tier: 'High',   min: 800, range: '₹75,000 – ₹1,50,000', rate: '12% p.a.', color: '#34d399' },
  { tier: 'Medium', min: 650, range: '₹25,000 – ₹50,000',   rate: '16% p.a.', color: '#fbbf24' },
  { tier: 'Low',    min: 450, range: '₹5,000 – ₹10,000',    rate: '22% p.a.', color: '#fb923c' },
];

const LoansPage = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    scoreApi.get()
      .then(setData)
      .catch(err => { if (err.message.includes('token')) navigate('/login'); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const score     = data?.score ?? 0;
  const loan      = data?.loan  ?? {};
  const eligible  = loan.tier && loan.tier !== 'None';

  return (
    <div className="app-container">
      <Sidebar active="Loans" />
      <div className="main-content">
        <TopNavbar />
        <main className="content-padding">
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Loan Eligibility</h2>
          <p style={{ color: '#94a3b8', marginBottom: '28px' }}>Based on your Gig Score of <strong style={{ color: 'white' }}>{loading ? '...' : score}</strong> / 1000</p>

          {/* Current eligibility */}
          <div className="glass-panel" style={{
            background: eligible
              ? 'linear-gradient(to right, rgba(6,78,59,0.3), rgba(6,78,59,0.1))'
              : 'linear-gradient(to right, rgba(127,29,29,0.3), rgba(127,29,29,0.1))',
            border: `1px solid ${eligible ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
            marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px'
          }}>
            {eligible
              ? <CheckCircle size={40} style={{ color: '#34d399', flexShrink: 0 }} />
              : <XCircle    size={40} style={{ color: '#ef4444', flexShrink: 0 }} />}
            <div>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>Your current eligibility</p>
              <p style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>
                {eligible ? `${loan.tier} Tier — ${loan.display}` : 'Not Eligible'}
              </p>
              {eligible && <p style={{ color: '#94a3b8', fontSize: '13px' }}>{loan.interestRate}% p.a. · Repayment up to 24 months</p>}
              {!eligible && <p style={{ color: '#94a3b8', fontSize: '13px' }}>Reach a Gig Score of 450+ to unlock loan offers.</p>}
            </div>
          </div>

          {/* All tiers */}
          <h3 style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>All Tiers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {TIERS.map(t => {
              const unlocked = score >= t.min;
              const current  = loan.tier === t.tier;
              return (
                <div key={t.tier} className="glass-panel" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: current ? `1px solid ${t.color}` : '1px solid rgba(255,255,255,0.06)',
                  opacity: unlocked ? 1 : 0.45
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.color }} />
                    <div>
                      <p style={{ color: 'white', fontWeight: 600 }}>{t.tier} Tier</p>
                      <p style={{ color: '#94a3b8', fontSize: '13px' }}>Score {t.min}+</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'white', fontWeight: 600 }}>{t.range}</p>
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>{t.rate}</p>
                  </div>
                  {current && <span style={{ marginLeft: '16px', fontSize: '12px', color: t.color, border: `1px solid ${t.color}`, padding: '2px 8px', borderRadius: '999px' }}>Current</span>}
                </div>
              );
            })}
          </div>

          {/* Score boost tip */}
          {!eligible && (
            <div className="glass-panel" style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.05)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <TrendingUp size={24} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ color: 'white', fontWeight: 600, marginBottom: '6px' }}>How to boost your score</p>
                <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8', paddingLeft: '16px' }}>
                  <li>Maintain a customer rating above 4.8</li>
                  <li>Log your earnings daily for consistent tracking</li>
                  <li>Complete 10+ trips per day</li>
                  <li>Keep earnings above ₹1,200/day</li>
                </ul>
              </div>
            </div>
          )}

          {eligible && (
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Apply for Loan <ArrowRight size={16} />
              <span style={{ fontSize: '12px', opacity: 0.6 }}>(Coming Soon)</span>
            </button>
          )}
        </main>
      </div>
    </div>
  );
};

export default LoansPage;
