/* Allow any string to be used as a route in Next.js Link and redirect */
declare module 'next/link' {
  import type { ComponentProps } from 'react';
  import type OriginalLink from 'next/link';

  type LinkProps = Omit<ComponentProps<typeof OriginalLink>, 'href'> & {
    href: string | { pathname: string; query?: Record<string, string> };
  };

  const Link: React.FC<LinkProps>;
  export default Link;
}

declare module 'next/navigation' {
  export function redirect(url: string, type?: 'replace' | 'push'): never;
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
    prefetch: (url: string) => void;
  };
  export function usePathname(): string;
  export function useParams<T extends Record<string, string> = Record<string, string>>(): T;
  export function useSearchParams(): URLSearchParams;
  export function notFound(): never;
}
