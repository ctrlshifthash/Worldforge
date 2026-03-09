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
  CHARACTER: '#FF6B2C',
  LOCATION: '#36B37E',
  FACTION: '#E84393',
  ARTIFACT: '#0984E3',
  SPECIES: '#7B61FF',
  EVENT: '#F39C12',
};

export const ENTITY_LABELS: Record<string, string> = {
  CHARACTER: 'Character',
  LOCATION: 'Location',
  FACTION: 'Faction',
  ARTIFACT: 'Artifact',
  SPECIES: 'Species',
  EVENT: 'Event',
};
