import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CameraOff, Loader } from 'lucide-react';

const MODEL_URL = '/models';

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

/**
 * FaceScanner
 * Props:
 *   onDescriptor(descriptor: number[]) — called when a face is captured
 *   onError(msg: string)
 *   mode: 'register' | 'login'
 *   autoCapture: bool — capture automatically when face is stable
 */
const FaceScanner = ({ onDescriptor, onError, mode = 'login', autoCapture = true }) => {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);

  const [status, setStatus] = useState('loading'); // loading | ready | scanning | detected | error | done
  const [faceCount, setFaceCount] = useState(0);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const capture = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    setStatus('scanning');

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detection) {
      setFaceCount(0);
      setStatus('ready');
      return;
    }

    // Draw box on canvas
    if (canvasRef.current) {
      const dims = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvasRef.current, dims);
      const resized = faceapi.resizeResults(detection, dims);
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, [resized]);
    }

    const descriptor = Array.from(detection.descriptor);
    setFaceCount(prev => {
      const next = prev + 1;
      if (autoCapture && next >= 3) {
        // Face stable for 3 consecutive detections — capture
        setStatus('done');
        stopCamera();
        onDescriptor(descriptor);
      } else {
        setStatus('detected');
      }
      return next;
    });
  }, [autoCapture, onDescriptor, stopCamera]);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        await loadModels();
        if (!active) return;

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('ready');

        // Poll every 700ms
        intervalRef.current = setInterval(capture, 700);
      } catch (err) {
        if (!active) return;
        const msg = err.name === 'NotAllowedError' ? 'Camera permission denied' : err.message;
        setStatus('error');
        onError?.(msg);
      }
    };

    start();
    return () => {
      active = false;
      stopCamera();
    };
  }, [capture, onError, stopCamera]);

  const manualCapture = async () => {
    if (status === 'ready' || status === 'detected') {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!detection) { onError?.('No face detected. Position your face in frame.'); return; }
      const descriptor = Array.from(detection.descriptor);
      setStatus('done');
      stopCamera();
      onDescriptor(descriptor);
    }
  };

  const statusColors = { loading: '#94a3b8', ready: '#94a3b8', scanning: '#60a5fa', detected: '#34d399', done: '#10b981', error: '#ef4444' };
  const statusText   = {
    loading:  'Loading face models...',
    ready:    'Position your face in frame',
    scanning: 'Scanning...',
    detected: `Face detected (${faceCount}/3)`,
    done:     'Face captured!',
    error:    'Camera error',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{
        position: 'relative', width: '280px', height: '210px',
        borderRadius: '12px', overflow: 'hidden',
        border: `2px solid ${statusColors[status]}`,
        background: '#0f172a', transition: 'border-color 0.3s'
      }}>
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#94a3b8' }}>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '12px' }}>Loading models...</span>
          </div>
        )}
        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#ef4444' }}>
            <CameraOff size={24} />
            <span style={{ fontSize: '12px' }}>Camera unavailable</span>
          </div>
        )}

        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: status === 'loading' || status === 'error' ? 'none' : 'block' }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
        />

        {/* Corner guides */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => {
          const [v, h] = corner.split('-');
          return (
            <div key={corner} style={{
              position: 'absolute', width: '20px', height: '20px',
              [v]: '8px', [h]: '8px',
              borderTop:    v === 'top'    ? `2px solid ${statusColors[status]}` : 'none',
              borderBottom: v === 'bottom' ? `2px solid ${statusColors[status]}` : 'none',
              borderLeft:   h === 'left'   ? `2px solid ${statusColors[status]}` : 'none',
              borderRight:  h === 'right'  ? `2px solid ${statusColors[status]}` : 'none',
              transition: 'border-color 0.3s'
            }} />
          );
        })}
      </div>

      <p style={{ fontSize: '13px', color: statusColors[status], transition: 'color 0.3s' }}>
        {statusText[status]}
      </p>

      {!autoCapture && (status === 'ready' || status === 'detected') && (
        <button onClick={manualCapture} className="btn-primary" style={{ width: '100%' }}>
          <Camera size={16} /> Capture Face
        </button>
      )}
    </div>
  );
};

export default FaceScanner;
