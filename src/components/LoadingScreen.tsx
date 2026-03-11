'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1600);
    const remove = setTimeout(() => setVisible(false), 2000);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`loading-screen${fadeOut ? ' loading-screen--fade' : ''}`}>
      <div className="loading-screen-content">
        <div className="loading-screen-logo">
          <img src="/logo.png" alt="Worldforge" width={60} height={60} />
        </div>
        <h1 className="loading-screen-title">Worldforge</h1>
        <p className="loading-screen-slogan">
          Your World.<br />
          <em>Alive.</em>
        </p>
        <div className="loading-screen-bar-track">
          <div className="loading-screen-bar-fill" />
        </div>
      </div>
    </div>
  );
}
