import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const LiveWeightContext = createContext(null);

const SOCKET_URL = 'http://localhost:5001';

export const LiveWeightProvider = ({ children }) => {
  const [liveKg, setLiveKg] = useState(null); // General weight or most recent
  const [liveTs, setLiveTs] = useState(null);
  const [liveProductKey, setLiveProductKey] = useState(null);
  const [liveByProduct, setLiveByProduct] = useState({});

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[live] Connected to MERN socket');
    });

    socket.on('inventory:weight_update', (data) => {
      console.log('[live] Weight update received:', data);
      
      const { productId, currentWeight, lastUpdatedByIoT } = data;
      
      setLiveKg(currentWeight);
      setLiveTs(lastUpdatedByIoT);
      setLiveProductKey(productId);
      
      setLiveByProduct((prev) => ({
        ...prev,
        [productId]: {
          current_weight_kg: currentWeight,
          last_updated: lastUpdatedByIoT
        }
      }));
    });

    socket.on('connect_error', (err) => {
      console.error('[live] Socket connection error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const value = useMemo(() => ({ liveKg, liveTs, liveProductKey, liveByProduct }), [liveKg, liveTs, liveProductKey, liveByProduct]);

  return <LiveWeightContext.Provider value={value}>{children}</LiveWeightContext.Provider>;
};

export const useLiveWeight = () => useContext(LiveWeightContext) || { liveKg: null, liveTs: null, liveProductKey: null, liveByProduct: {} };
