import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, CloudRain, Sun, Thermometer, Trash2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { historyApi } from '../services/api';

const WeatherIcon = ({ w }) => {
  if (w === 'Rain') return <CloudRain size={14} style={{ color: '#60a5fa' }} />;
  if (w === 'Heat') return <Thermometer size={14} style={{ color: '#fb923c' }} />;
  return <Sun size={14} style={{ color: '#fbbf24' }} />;
};

const HistoryPage = () => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    historyApi.get(90)
      .then(data => setRows(data))
      .catch(err => {
        if (err.message.includes('token')) navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this entry?')) return;
    await historyApi.remove(id);
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const totalEarnings = rows.reduce((s, r) => s + Number(r.earnings), 0);
  const totalTrips    = rows.reduce((s, r) => s + Number(r.trips), 0);
  const avgRating     = rows.length ? (rows.reduce((s, r) => s + Number(r.rating), 0) / rows.length).toFixed(2) : '—';

  return (
    <div className="app-container">
      <Sidebar active="History" />
      <div className="main-content">
        <TopNavbar />
        <main className="content-padding">
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Work History</h2>

          {/* Summary strip */}
          <div className="grid-cols-3" style={{ marginBottom: '24px' }}>
            {[
              { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}` },
              { label: 'Total Trips', value: totalTrips },
              { label: 'Avg Rating', value: avgRating + ' ★' },
            ].map(({ label, value }) => (
              <div key={label} className="glass-panel" style={{ padding: '20px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{label}</p>
                <p style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel">
            {loading ? (
              <p style={{ color: '#94a3b8', padding: '32px', textAlign: 'center' }}>Loading...</p>
            ) : rows.length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '32px', textAlign: 'center' }}>No history yet. Add entries from the Dashboard.</p>
            ) : (
              <div className="table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Earnings</th>
                      <th>Trips</th>
                      <th>Rating</th>
                      <th>Weather</th>
                      <th style={{ textAlign: 'right' }}>Score Impact</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id}>
                        <td>{new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={{ fontWeight: 600, color: 'white' }}>₹{Number(row.earnings).toLocaleString('en-IN')}</td>
                        <td style={{ color: '#94a3b8' }}>{row.trips}</td>
                        <td style={{ color: '#94a3b8' }}>{Number(row.rating).toFixed(1)} ★</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                            <WeatherIcon w={row.weather} />
                            {row.weather}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            {row.score_impact > 0 ? <TrendingUp size={14} style={{ color: '#34d399' }} />
                              : row.score_impact < 0 ? <TrendingDown size={14} style={{ color: '#ef4444' }} />
                              : <Minus size={14} style={{ color: '#94a3b8' }} />}
                            <span style={{ color: row.score_impact > 0 ? '#34d399' : row.score_impact < 0 ? '#ef4444' : '#94a3b8' }}>
                              {row.score_impact > 0 ? '+' : ''}{row.score_impact}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button onClick={() => handleDelete(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
