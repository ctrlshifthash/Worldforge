import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export const ENTITY_COLORS: Record<string, string> = {
  CHARACTER: '#c8a44e',
  LOCATION: '#4a9a6e',
  FACTION: '#9a4a6e',
  ARTIFACT: '#4a6e9a',
  SPECIES: '#8a4a9a',
  EVENT: '#9a7a4a',
};

export const ENTITY_LABELS: Record<string, string> = {
  CHARACTER: 'Character',
  LOCATION: 'Location',
  FACTION: 'Faction',
  ARTIFACT: 'Artifact',
  SPECIES: 'Species',
  EVENT: 'Event',
};
