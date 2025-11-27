import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { AppText } from '@/components/common/AppText';

interface SearchResultHighlightProps {
  text: string;
  searchQuery: string;
  style?: TextStyle;
  highlightStyle?: TextStyle;
  numberOfLines?: number;
}

/**
 * SearchResultHighlight - Highlights search terms in search results
 * 
 * @example
 * <SearchResultHighlight
 *   text="Email subject here"
 *   searchQuery="email"
 *   style={styles.text}
 *   highlightStyle={styles.highlight}
 * />
 */
export function SearchResultHighlight({
  text,
  searchQuery,
  style,
  highlightStyle,
  numberOfLines,
}: SearchResultHighlightProps) {
  if (!searchQuery.trim()) {
    return (
      <AppText style={style} numberOfLines={numberOfLines} dynamicTypeStyle="body">
        {text}
      </AppText>
    );
  }

  const query = searchQuery.trim();
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <AppText style={style} numberOfLines={numberOfLines} dynamicTypeStyle="body">
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return (
          <AppText
            key={index}
            style={isMatch ? [style, highlightStyle] : style}
          >
            {part}
          </AppText>
        );
      })}
    </AppText>
  );
}

