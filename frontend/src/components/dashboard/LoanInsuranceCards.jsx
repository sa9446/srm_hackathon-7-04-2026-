import React from 'react';
import { PiggyBank, ShieldCheck, ArrowRight } from 'lucide-react';

const LoanInsuranceCards = ({ loan, insurance }) => {
  const loanDisplay   = loan?.display   ?? '₹25,000 – ₹50,000';
  const loanTier      = loan?.tier      ?? 'Medium';
  const loanRate      = loan?.interestRate ?? 16;
  const loanEligible  = loanTier !== 'None';

  const insPlan       = insurance?.plan    ?? 'Standard';
  const insCoverage   = insurance?.coverage ?? '₹5,00,000';
  const insPremium    = insurance?.premium  ?? '₹299/month';
  const insEligible   = insurance?.status === 'Eligible';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Loan Card */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(to bottom right, #1e293b, rgba(6, 78, 59, 0.2))',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{ position: 'absolute', right: '-24px', top: '-24px', color: 'rgba(16, 185, 129, 0.1)' }}>
          <PiggyBank size={120} />
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <PiggyBank size={18} style={{ color: '#34d399' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loan Offers</h3>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
            {loanEligible ? `${loanTier} Tier Eligible` : 'Not Eligible Yet'}
          </p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
            {loanEligible ? loanDisplay : '—'}
          </p>
          {loanEligible && (
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>{loanRate}% p.a. interest rate</p>
          )}
        </div>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: loanEligible ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
          color: loanEligible ? 'white' : '#64748b',
          padding: '10px 16px', borderRadius: '8px', border: 'none',
          fontSize: '14px', fontWeight: 500, cursor: loanEligible ? 'pointer' : 'default'
        }}>
          <span>{loanEligible ? 'Apply (Coming Soon)' : 'Improve your score to unlock'}</span>
          {loanEligible && <ArrowRight size={16} />}
        </button>
      </div>

      {/* Insurance Card */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(to bottom right, #1e293b, rgba(22, 78, 99, 0.2))',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: '128px', height: '128px', backgroundColor: 'rgba(34, 211, 238, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#22d3ee' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insurance</h3>
            </div>
            <span style={{
              backgroundColor: insEligible ? 'rgba(34, 211, 238, 0.2)' : 'rgba(100,116,139,0.2)',
              color: insEligible ? '#22d3ee' : '#64748b',
              fontSize: '12px', padding: '4px 8px', borderRadius: '9999px',
              border: `1px solid ${insEligible ? 'rgba(34, 211, 238, 0.3)' : 'rgba(100,116,139,0.3)'}`
            }}>
              {insEligible ? 'Eligible' : 'Not Eligible'}
            </span>
          </div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
            {insPlan} Plan
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
            {insEligible
              ? `Coverage up to ${insCoverage} · ${insPremium}`
              : 'Reach a score of 400+ to unlock insurance coverage.'}
          </p>
        </div>
        {insEligible && (
          <button style={{ marginTop: '16px', width: '100%', textAlign: 'center', color: '#22d3ee', fontSize: '14px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
            View Policy Details
          </button>
        )}
      </div>
    </div>
  );
};

export default LoanInsuranceCards;
