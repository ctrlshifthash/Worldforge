'use client';

/* eslint-disable @next/next/no-img-element */

const SOCIALS = [
  {
    name: 'Pump.fun',
    href: '#',
    img: '/socials/pumpfun.jpg',
    dark: false,
  },
  {
    name: 'X',
    href: '#',
    img: '/socials/x.png',
    dark: false,
  },
  {
    name: 'GitHub',
    href: '#',
    img: '/socials/github.png',
    dark: false,
  },
  {
    name: 'GitBook',
    href: '#',
    img: '/socials/gitbook.png',
    dark: true,
  },
  {
    name: 'Medium',
    href: '#',
    img: '/socials/medium.png',
    dark: true,
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
            <img src={s.img} alt={s.name} width={44} height={44} />
          </span>
          <span className="social-link-name">{s.name}</span>
        </a>
      ))}
    </div>
  );
}
