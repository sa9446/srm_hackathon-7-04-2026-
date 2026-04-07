import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const HistoryTable = ({ data }) => {
  return (
    <div className="glass-panel" style={{ position: 'relative' }}>
      <div className="table-header">
        <h3 className="chart-title" style={{ margin: 0 }}>Daily History</h3>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>Last 7 Days</span>
      </div>
      <div className="table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Earnings</th>
              <th>Trips</th>
              <th>Rating</th>
              <th style={{ textAlign: 'right' }}>Score Impact</th>
            </tr>
          </thead>
          <tbody>
            {data.slice().reverse().map((row, i) => (
              <tr key={i}>
                <td>{new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td style={{ fontWeight: 500, color: 'white' }}>₹{row.earnings}</td>
                <td style={{ color: '#94a3b8' }}>{row.trips}</td>
                <td style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{row.rating.toFixed(1)}</span>
                  <span style={{ color: '#fbbf24' }}>★</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    {row.scoreImpact > 0 ? (
                      <TrendingUp size={16} style={{ color: '#34d399' }} />
                    ) : row.scoreImpact < 0 ? (
                      <TrendingDown size={16} style={{ color: '#ef4444' }} />
                    ) : (
                      <Minus size={16} style={{ color: '#94a3b8' }} />
                    )}
                    <span style={{ color: row.scoreImpact > 0 ? '#34d399' : row.scoreImpact < 0 ? '#ef4444' : '#94a3b8' }}>
                      {row.scoreImpact > 0 ? '+' : ''}{row.scoreImpact}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                  No history data available. Start tracking your gig!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
