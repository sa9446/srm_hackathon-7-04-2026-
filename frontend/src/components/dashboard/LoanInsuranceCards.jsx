import React from 'react';
import { PiggyBank, ShieldCheck, ArrowRight } from 'lucide-react';

const LoanInsuranceCards = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ 
        background: 'linear-gradient(to bottom right, #1e293b, rgba(6, 78, 59, 0.2))',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ position: 'absolute', right: '-24px', top: '-24px', color: 'rgba(16, 185, 129, 0.1)' }}>
          <PiggyBank size={120} />
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <PiggyBank size={18} style={{ color: '#34d399' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loan Offers</h3>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Eligible for Medium Loan</p>
          <p style={{ fontSize: '30px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
            ₹25,000<span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 'normal' }}> - ₹50,000</span>
          </p>
        </div>
        <button style={{ 
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 16px',
          borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
        }}>
          <span>Apply (Coming Soon)</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="glass-panel" style={{ 
        background: 'linear-gradient(to bottom right, #1e293b, rgba(22, 78, 99, 0.2))',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: '128px', height: '128px', backgroundColor: 'rgba(34, 211, 238, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#22d3ee' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insurance</h3>
            </div>
            <span style={{ backgroundColor: 'rgba(34, 211, 238, 0.2)', color: '#22d3ee', fontSize: '12px', padding: '4px 8px', borderRadius: '9999px', border: '1px solid rgba(34, 211, 238, 0.3)' }}>Active</span>
          </div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Usage-Based Coverage</p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Your active trips are fully insured under the standard protection plan.</p>
        </div>
        <button style={{ 
          marginTop: '24px', width: '100%', textAlign: 'center', color: '#22d3ee', fontSize: '14px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer'
        }}>
          View Policy Details
        </button>
      </div>
    </div>
  );
};

export default LoanInsuranceCards;
