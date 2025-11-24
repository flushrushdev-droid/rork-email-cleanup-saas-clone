import type { ComponentType } from 'react';
import { Archive, Trash2, FolderOpen } from 'lucide-react-native';

export type SuggestionType = 'archive' | 'delete' | 'move';

export function getSuggestionIcon(type: SuggestionType): ComponentType<any> {
  switch (type) {
    case 'archive':
      return Archive;
    case 'delete':
      return Trash2;
    case 'move':
      return FolderOpen;
  }
}

export function getSuggestionColor(type: SuggestionType, colors: any): string {
  switch (type) {
    case 'archive':
      return colors.primary;
    case 'delete':
      return colors.danger;
    case 'move':
      return colors.secondary;
  }
}

