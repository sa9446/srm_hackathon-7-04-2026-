import React, { useState, useEffect } from 'react';
import { Star, ShieldAlert, BadgeIndianRupee } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import MetricCard from '../components/dashboard/MetricCard';
import RideControl from '../components/dashboard/RideControl';
import ChartsSection from '../components/dashboard/ChartsSection';
import HistoryTable from '../components/dashboard/HistoryTable';
import AddEntryForm from '../components/dashboard/AddEntryForm';
import StatusPanel from '../components/dashboard/StatusPanel';
import LoanInsuranceCards from '../components/dashboard/LoanInsuranceCards';

// Initial Mock Data
const INITIAL_HISTORY = [
  { id: 1, date: '2026-04-01T10:00:00Z', earnings: 1200, trips: 8, rating: 4.8, scoreImpact: 5, weather: 'Normal' },
  { id: 2, date: '2026-04-02T10:00:00Z', earnings: 1550, trips: 12, rating: 5.0, scoreImpact: 12, weather: 'Normal' },
  { id: 3, date: '2026-04-03T10:00:00Z', earnings: 900, trips: 6, rating: 4.5, scoreImpact: -2, weather: 'Rain' },
  { id: 4, date: '2026-04-04T10:00:00Z', earnings: 1800, trips: 14, rating: 4.9, scoreImpact: 8, weather: 'Normal' },
  { id: 5, date: '2026-04-05T10:00:00Z', earnings: 1100, trips: 9, rating: 4.7, scoreImpact: 3, weather: 'Heat' },
  { id: 6, date: '2026-04-06T10:00:00Z', earnings: 1450, trips: 11, rating: 5.0, scoreImpact: 6, weather: 'Normal' },
  { id: 7, date: '2026-04-07T10:00:00Z', earnings: 1600, trips: 13, rating: 4.9, scoreImpact: 5, weather: 'Normal' },
];

const Dashboard = () => {
  const [historyData, setHistoryData] = useState(INITIAL_HISTORY);
  const [isTracking, setIsTracking] = useState(false);
  const [gigScore, setGigScore] = useState(742);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(res => setTimeout(res, 500));
    };
    fetchData();
  }, []);

  const handleAddEntry = async (entry) => {
    await new Promise(res => setTimeout(res, 300));
    const scoreImpact = entry.rating >= 4.8 ? 5 : entry.rating < 4.0 ? -5 : 0;
    
    const newEntry = {
      id: Date.now(),
      ...entry,
      scoreImpact
    };
    
    setHistoryData([...historyData, newEntry]);
    setGigScore(prev => prev + scoreImpact);
  };

  const handleRideStateChange = async (state) => {
    setIsTracking(state);
    await new Promise(res => setTimeout(res, 300));
  };

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
              subtitle="Excellent rating" 
              icon={<Star size={24} style={{ color: '#fbbf24' }} />}
              valueColor="emerald"
            />
            <MetricCard 
              title="Loan Eligibility" 
              value="Medium" 
              subtitle="₹25k - ₹50k range" 
              icon={<BadgeIndianRupee size={24} style={{ color: '#22d3ee' }} />}
              valueColor="cyan"
            />
            <MetricCard 
              title="Risk Level" 
              value="Low" 
              subtitle="Consistent performer" 
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
              <RideControl onStatusChange={handleRideStateChange} />
              <StatusPanel isTracking={isTracking} />
              <LoanInsuranceCards />
              <AddEntryForm onAdd={handleAddEntry} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
