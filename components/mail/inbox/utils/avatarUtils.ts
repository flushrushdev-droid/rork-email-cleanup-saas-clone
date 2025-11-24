import { avatarColors } from '../constants';

export function getAvatarColor(email: string): string {
  const colorIndex = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[colorIndex];
}

export function getInitial(name: string): string {
  return name[0]?.toUpperCase() || '?';
}

