'use client';

/* eslint-disable @next/next/no-img-element */

const SOCIALS = [
  {
    name: 'Pump.fun',
    href: '#',
    img: '/socials/pumpfun.jpg',
    dark: false,
    scale: '100%',
  },
  {
    name: 'X',
    href: '#',
    img: '/socials/x.png',
    dark: false,
    scale: '70%',
  },
  {
    name: 'GitHub',
    href: '#',
    img: '/socials/github.png',
    dark: false,
    scale: '100%',
  },
  {
    name: 'GitBook',
    href: '#',
    img: '/socials/gitbook.png',
    dark: true,
    scale: '100%',
  },
  {
    name: 'Medium',
    href: '#',
    img: '/socials/medium.png',
    dark: true,
    scale: '75%',
  },
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
          <span className={`social-link-icon${s.dark ? ' social-link-icon--dark' : ''}`}>
            <img src={s.img} alt={s.name} width={44} height={44} style={{ width: s.scale, height: s.scale, objectFit: 'contain' }} />
          </span>
          <span className="social-link-name">{s.name}</span>
        </a>
      ))}
    </div>
  );
}
