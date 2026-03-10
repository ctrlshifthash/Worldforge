'use client';

/* eslint-disable @next/next/no-img-element */

const SOCIALS = [
  {
    name: 'Pump.fun',
    href: '#',
    img: 'https://static.wixstatic.com/media/e2da02_f4e8abcf31d04d96a78f997107f092a3~mv2.jpg',
  },
  {
    name: 'X',
    href: '#',
    img: 'https://static.wixstatic.com/media/e2da02_7248f73ef41b4355afd7394c08b66bca~mv2.png',
  },
  {
    name: 'GitHub',
    href: '#',
    img: 'https://static.wixstatic.com/media/e2da02_54130f69a18e424cb3f9e81f6d12aaab~mv2.png',
  },
  {
    name: 'GitBook',
    href: '#',
    img: 'https://static.wixstatic.com/media/e2da02_c1e9f4c9699e45a6a63580f4ed6db40c~mv2.png',
  },
  {
    name: 'Medium',
    href: '#',
    img: 'https://static.wixstatic.com/media/e2da02_f1515d12f45d4c7b9a27f0fbb76412ad~mv2.png',
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
          <span className="social-link-icon">
            <img src={s.img} alt={s.name} width={44} height={44} />
          </span>
          <span className="social-link-name">{s.name}</span>
        </a>
      ))}
    </div>
  );
}
