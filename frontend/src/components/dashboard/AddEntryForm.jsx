import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddEntryForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    earnings: '',
    trips: '',
    rating: '5.0',
    weather: 'Normal'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.earnings || !formData.trips) return;
    
    onAdd({
      earnings: Number(formData.earnings),
      trips: Number(formData.trips),
      rating: Number(formData.rating),
      weather: formData.weather,
      date: new Date().toISOString()
    });
    
    setFormData({ earnings: '', trips: '', rating: '5.0', weather: 'Normal' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="glass-panel" style={{ border: '1px solid rgba(16, 185, 129, 0.1)' }}>
      <h3 className="chart-title" style={{ color: 'white' }}>Add Manual Entry</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Earnings (₹)</label>
          <input 
            type="number" 
            name="earnings"
            value={formData.earnings}
            onChange={handleChange}
            placeholder="e.g. 1500"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Total Trips</label>
          <input 
            type="number" 
            name="trips"
            value={formData.trips}
            onChange={handleChange}
            placeholder="e.g. 12"
            className="form-input"
          />
        </div>
        <div className="flex-row-gap">
          <div className="form-group">
            <label className="form-label">Rating</label>
            <input 
              type="number" 
              step="0.1"
              max="5"
              min="1"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Weather</label>
            <select 
              name="weather"
              value={formData.weather}
              onChange={handleChange}
              className="form-input"
            >
              <option value="Normal">Normal</option>
              <option value="Rain">Rain</option>
              <option value="Heat">Heat</option>
            </select>
          </div>
        </div>
        
        <button 
          type="submit"
          className="btn-secondary"
          disabled={!formData.earnings || !formData.trips}
        >
          <Plus size={16} />
          <span>Add Today's Data</span>
        </button>
      </form>
    </div>
  );
};

export default AddEntryForm;
