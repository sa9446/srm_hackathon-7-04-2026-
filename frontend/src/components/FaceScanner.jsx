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

// Draw current video frame to an offscreen canvas and return it.
// Returns null if the video isn't producing real pixels yet (Android WebView
// reports readyState >= 2 but videoWidth=0 for a brief period after play()).
function grabFrame(video) {
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;
  const c = document.createElement('canvas');
  c.width  = video.videoWidth;
  c.height = video.videoHeight;
  c.getContext('2d').drawImage(video, 0, 0);
  return c;
}

const FaceScanner = ({ onDescriptor, onError, mode = 'login', autoCapture = true }) => {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);
  const faceCountRef = useRef(0); // avoid stale closure in setInterval

  const [status, setStatus]     = useState('loading');
  const [faceCount, setFaceCount] = useState(0);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (streamRef.current)   { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    // Guard: video must have real pixel data
    if (!video || video.paused || video.ended) return;
    const frame = grabFrame(video);
    if (!frame) return; // videoWidth still 0 — wait for next tick

    setStatus('scanning');
    let detection;
    try {
      detection = await faceapi
        .detectSingleFace(frame, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();
    } catch {
      // Tensor errors (empty frame race) — just skip this tick
      return;
    }

    if (!detection) {
      faceCountRef.current = 0;
      setFaceCount(0);
      setStatus('ready');
      return;
    }

    // Draw bounding box on the overlay canvas
    if (canvasRef.current && video.videoWidth > 0) {
      const dims = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvasRef.current, dims);
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, [faceapi.resizeResults(detection, dims)]);
    }

    faceCountRef.current += 1;
    setFaceCount(faceCountRef.current);
    setStatus('detected');

    if (autoCapture && faceCountRef.current >= 3) {
      const descriptor = Array.from(detection.descriptor);
      setStatus('done');
      stopCamera();
      onDescriptor(descriptor);
    }
  }, [autoCapture, onDescriptor, stopCamera]);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        await loadModels();
        if (!active) return;

        // Use 'ideal' constraints — lets Android pick the best resolution
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'user' }, width: { ideal: 320 }, height: { ideal: 240 } },
          audio: false,
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        // Wait for the 'playing' event — this is when Android WebView
        // actually starts delivering pixel data (readyState alone isn't enough)
        await new Promise((resolve, reject) => {
          video.onplaying = resolve;
          video.onerror   = reject;
          video.play().catch(reject);
        });

        if (!active) return;
        setStatus('ready');

        // Give Android an extra 500ms to fill the first frame before we start
        await new Promise(r => setTimeout(r, 500));
        if (!active) return;

        // Poll every 900ms — slightly slower for mobile GPUs
        intervalRef.current = setInterval(runDetection, 900);
      } catch (err) {
        if (!active) return;
        const msg = err.name === 'NotAllowedError'
          ? 'Camera permission denied — please allow camera access'
          : 'Camera error: ' + err.message;
        setStatus('error');
        onError?.(msg);
      }
    };

    start();
    return () => { active = false; stopCamera(); };
  }, [runDetection, onError, stopCamera]);

  const manualCapture = async () => {
    const video = videoRef.current;
    const frame = grabFrame(video);
    if (!frame) { onError?.('No camera frame yet — wait a moment and try again.'); return; }

    let detection;
    try {
      detection = await faceapi
        .detectSingleFace(frame, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();
    } catch { onError?.('Detection failed — try again.'); return; }

    if (!detection) { onError?.('No face detected. Position your face in the frame.'); return; }
    setStatus('done');
    stopCamera();
    onDescriptor(Array.from(detection.descriptor));
  };

  const color = { loading: '#94a3b8', ready: '#94a3b8', scanning: '#60a5fa', detected: '#34d399', done: '#10b981', error: '#ef4444' }[status];
  const label = {
    loading:  'Loading face models...',
    ready:    'Position your face in frame',
    scanning: 'Scanning...',
    detected: `Face detected (${faceCount}/3)`,
    done:     'Face captured!',
    error:    'Camera error',
  }[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{
        position: 'relative', width: '280px', height: '210px',
        borderRadius: '12px', overflow: 'hidden',
        border: `2px solid ${color}`, background: '#0f172a', transition: 'border-color 0.3s',
      }}>
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#94a3b8' }}>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '12px' }}>Loading models...</span>
          </div>
        )}
        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#ef4444', padding: '12px', textAlign: 'center' }}>
            <CameraOff size={24} />
            <span style={{ fontSize: '12px' }}>Camera unavailable</span>
          </div>
        )}

        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)',
            display: status === 'loading' || status === 'error' ? 'none' : 'block' }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
        />

        {/* Corner guides */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v, h]) => (
          <div key={v+h} style={{
            position: 'absolute', width: '20px', height: '20px',
            [v]: '8px', [h]: '8px',
            borderTop:    v==='top'    ? `2px solid ${color}` : 'none',
            borderBottom: v==='bottom' ? `2px solid ${color}` : 'none',
            borderLeft:   h==='left'   ? `2px solid ${color}` : 'none',
            borderRight:  h==='right'  ? `2px solid ${color}` : 'none',
            transition: 'border-color 0.3s',
          }} />
        ))}
      </div>

      <p style={{ fontSize: '13px', color, transition: 'color 0.3s', textAlign: 'center', maxWidth: '280px' }}>{label}</p>

      {!autoCapture && (status === 'ready' || status === 'detected') && (
        <button onClick={manualCapture} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Camera size={16} /> Capture Face
        </button>
      )}
    </div>
  );
};

export default FaceScanner;
