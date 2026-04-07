import { useState, useEffect, useRef, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';

// Haversine formula — distance between two coords in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * useLocationTracking
 * Tracks GPS position, speed, and distance while a ride is active.
 * Uses @capacitor/geolocation on native (Android), falls back to
 * navigator.geolocation on web.
 *
 * Returns: { location, speed, distance, isTracking, error, start, stop, reset }
 */
export function useLocationTracking() {
  const [location, setLocation]   = useState(null);  // { lat, lng, accuracy }
  const [speed, setSpeed]         = useState(0);      // km/h
  const [distance, setDistance]   = useState(0);      // km
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError]         = useState('');

  const watchIdRef  = useRef(null);
  const lastPosRef  = useRef(null);
  const distRef     = useRef(0);

  const handlePosition = useCallback((pos) => {
    const { latitude: lat, longitude: lng, accuracy, speed: rawSpeed } = pos.coords;
    setLocation({ lat, lng, accuracy });

    // Speed: use GPS speed if available, else compute from position delta
    if (rawSpeed != null && rawSpeed >= 0) {
      setSpeed(Math.round(rawSpeed * 3.6)); // m/s → km/h
    } else if (lastPosRef.current) {
      const dt = (pos.timestamp - lastPosRef.current.timestamp) / 3600000; // hours
      if (dt > 0) {
        const km = haversine(lastPosRef.current.lat, lastPosRef.current.lng, lat, lng);
        setSpeed(Math.round(km / dt));
      }
    }

    // Accumulate distance
    if (lastPosRef.current) {
      const km = haversine(lastPosRef.current.lat, lastPosRef.current.lng, lat, lng);
      if (km < 0.5) { // ignore GPS jumps > 500m
        distRef.current += km;
        setDistance(Math.round(distRef.current * 10) / 10);
      }
    }

    lastPosRef.current = { lat, lng, timestamp: pos.timestamp };
  }, []);

  const start = useCallback(async () => {
    setError('');
    try {
      // Request permission (needed on Android via Capacitor)
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== 'granted') {
        setError('Location permission denied');
        return;
      }

      setIsTracking(true);
      watchIdRef.current = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (pos, err) => {
          if (err) { setError(err.message); return; }
          handlePosition(pos);
        }
      );
    } catch (err) {
      // Fallback for web browser
      if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
      setIsTracking(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        (err) => setError(err.message),
        { enableHighAccuracy: true, maximumAge: 2000 }
      );
    }
  }, [handlePosition]);

  const stop = useCallback(async () => {
    setIsTracking(false);
    if (watchIdRef.current == null) return;
    try {
      await Geolocation.clearWatch({ id: watchIdRef.current });
    } catch {
      navigator.geolocation?.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    lastPosRef.current = null;
  }, []);

  const reset = useCallback(() => {
    distRef.current = 0;
    setDistance(0);
    setSpeed(0);
    setLocation(null);
    lastPosRef.current = null;
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => () => { stop(); }, [stop]);

  return { location, speed, distance, isTracking, error, start, stop, reset };
}
