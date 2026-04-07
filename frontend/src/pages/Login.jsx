import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace } from 'lucide-react';

const Login = () => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const navigate = useNavigate();

  const handleScan = () => {
    setScanning(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Gig-Sentry</h1>
        <p className="login-subtitle">Secure Identity Verification</p>

        <div 
          onClick={!scanning ? handleScan : undefined}
          className={`scan-area ${scanning ? 'scanning' : ''}`}
        >
          <ScanFace size={64} className={`scan-icon ${scanning ? 'scanning' : ''}`} />
          
          {scanning && (
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '50%',
                clipPath: `polygon(0 ${100 - scanProgress}%, 100% ${100 - scanProgress}%, 100% 100%, 0% 100%)`,
                transition: 'clip-path 0.2s linear'
              }}
            />
          )}

          {scanning && (
            <div 
              style={{
                position: 'absolute',
                width: '100%',
                height: '4px',
                backgroundColor: '#3b82f6',
                boxShadow: '0 0 10px #3b82f6',
                top: `${100 - scanProgress}%`,
                transition: 'top 0.2s linear'
              }}
            />
          )}
        </div>

        <p className="login-status">
          {scanning ? (
            scanProgress < 100 ? 'Scanning biometrics...' : 'Identity Verified'
          ) : (
            'Tap to scan face'
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
