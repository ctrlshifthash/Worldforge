'use client';

import { useState } from 'react';

export function CaBadge() {
  const [copied, setCopied] = useState(false);
  const ca = '8QZJYXVU2SUi3qesyGrHyTj21JSrs5xpLReTC1CLpump';

  const handleClick = () => {
    navigator.clipboard.writeText(ca).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button className="ca-badge" onClick={handleClick} title="Click to copy">
      <span className="ca-badge-label">CA:</span>
      <span className="ca-badge-address">{ca}</span>
      <span className={`ca-badge-copied ${copied ? 'show' : ''}`}>Copied!</span>
    </button>
  );
}
