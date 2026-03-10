'use client';

const SOCIALS = [
  { name: 'Pump.fun', href: '#', icon: '🟢' },
  { name: 'X', href: '#', icon: '𝕏' },
  { name: 'GitBook', href: '#', icon: '📖' },
  { name: 'Medium', href: '#', icon: 'M' },
];

export function SocialLinks() {
  return (
    <div className="social-links">
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          title={s.name}
        >
          <span className="social-link-icon">{s.icon}</span>
          <span className="social-link-name">{s.name}</span>
        </a>
      ))}
    </div>
  );
}
