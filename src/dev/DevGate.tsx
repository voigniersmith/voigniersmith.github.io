import React, { useEffect, useState } from 'react';
import DesktopCanvas from './canvas/DesktopCanvas';
import MobileCanvas from './canvas/MobileCanvas';
import './pixel.css';

interface DevGateProps {
  onExit: () => void;
}

export default function DevGate({ onExit }: DevGateProps) {
  const [mobile, setMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return mobile
    ? <MobileCanvas onExit={onExit} />
    : <DesktopCanvas onExit={onExit} />;
}
