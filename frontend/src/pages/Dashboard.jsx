import React, { useState, useEffect } from 'react';
import { Star, ShieldAlert, BadgeIndianRupee, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import MetricCard from '../components/dashboard/MetricCard';
import RideControl from '../components/dashboard/RideControl';
import ChartsSection from '../components/dashboard/ChartsSection';
import HistoryTable from '../components/dashboard/HistoryTable';
import AddEntryForm from '../components/dashboard/AddEntryForm';
import StatusPanel from '../components/dashboard/StatusPanel';
import LoanInsuranceCards from '../components/dashboard/LoanInsuranceCards';
import { historyApi, scoreApi, rideApi } from '../services/api';

const Dashboard = () => {
  const [historyData, setHistoryData] = useState([]);
  const [scoreData, setScoreData]     = useState(null);
  const [isTracking, setIsTracking]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const navigate = useNavigate();

  // Map API row keys → component expected keys
  const normaliseRow = (r) => ({
    id:          r.id,
    date:        r.date,
    earnings:    Number(r.earnings),
    trips:       Number(r.trips),
    rating:      Number(r.rating),
    scoreImpact: Number(r.score_impact),
    weather:     r.weather,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [history, score, rideStatus] = await Promise.all([
          historyApi.get(30),
          scoreApi.get(),
          rideApi.status(),
        ]);
        setHistoryData(history.map(normaliseRow));
        setScoreData(score);
        setIsTracking(rideStatus.is_active || false);
      } catch (err) {
        if (err.message.includes('Invalid token') || err.message.includes('No token')) {
          navigate('/login');
        } else {
          setError('Failed to load data. Is the backend running?');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleAddEntry = async (entry) => {
    try {
      const result = await historyApi.add(entry);
      setHistoryData(prev => [normaliseRow(result), ...prev]);
      const score = await scoreApi.get();
      setScoreData(score);
    } catch (err) {
      alert('Failed to add entry: ' + err.message);
    }
  };

  const handleRideStateChange = async (active) => {
    try {
      if (active) await rideApi.start();
      else await rideApi.stop();
    } catch (err) {
      console.error('Ride toggle failed:', err.message);
    }
    setIsTracking(active);
  };

  const handleLogout = () => {
    localStorage.removeItem('gig_token');
    localStorage.removeItem('gig_user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#f87171', flexDirection: 'column', gap: '12px' }}>
        <p>{error}</p>
        <button className="btn-secondary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const gigScore    = scoreData?.score         ?? 500;
  const loanTier    = scoreData?.loan?.tier    ?? 'Medium';
  const loanDisplay = scoreData?.loan?.display ?? '₹25,000 – ₹50,000';
  const riskLevel   = scoreData?.riskLevel     ?? 'Medium';
  const scoreLabel  = scoreData?.label         ?? 'Fair';

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopNavbar />

        <main className="content-padding">
          <div className="grid-cols-3">
            <MetricCard
              title="Gig Score"
              value={`${gigScore} / 1000`}
              subtitle={scoreLabel}
              icon={<Star size={24} style={{ color: '#fbbf24' }} />}
              valueColor="emerald"
            />
            <MetricCard
              title="Loan Eligibility"
              value={loanTier}
              subtitle={loanDisplay}
              icon={<BadgeIndianRupee size={24} style={{ color: '#22d3ee' }} />}
              valueColor="cyan"
            />
            <MetricCard
              title="Risk Level"
              value={riskLevel}
              subtitle={scoreLabel + ' performer'}
              icon={<ShieldAlert size={24} style={{ color: '#34d399' }} />}
              valueColor="emerald"
            />
          </div>

          <div className="grid-cols-4">
            <div className="col-span-3">
              <ChartsSection historyData={historyData} />
              <HistoryTable data={historyData} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <RideControl onStatusChange={handleRideStateChange} initialActive={isTracking} />
              <StatusPanel isTracking={isTracking} />
              <LoanInsuranceCards loan={scoreData?.loan} insurance={scoreData?.insurance} />
              <AddEntryForm onAdd={handleAddEntry} />
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
