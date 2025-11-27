import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Mail, Archive, HardDrive, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatCard } from '@/components/common/StatCard';
import { formatAccessibilityLabel } from '@/utils/accessibility';
import { createOverviewStyles } from '@/styles/app/index';

interface HealthCardProps {
  health: {
    score: number;
    trend: 'up' | 'down';
    unreadCount: number;
    noisePercentage: number;
    largeAttachmentsCount: number;
    automationCoverage: number;
  };
  colors: any;
  router: ReturnType<typeof useRouter>;
}

const getHealthGrade = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Attention';
};

export function HealthCard({ health, colors, router }: HealthCardProps) {
  const styles = React.useMemo(() => createOverviewStyles(colors), [colors]);

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.healthCard}
    >
      <View style={styles.healthHeader}>
        <View>
          <Text 
            style={styles.healthLabel}
            accessible={true}
            accessibilityRole="text"
          >
            Overall Score
          </Text>
          <Text 
            style={styles.healthGrade}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={formatAccessibilityLabel('Overall health grade: {grade}', { grade: getHealthGrade(health.score) })}
          >
            {getHealthGrade(health.score)}
          </Text>
        </View>
        <View style={styles.healthScoreContainer}>
          <Text 
            style={styles.healthScore}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={formatAccessibilityLabel('Inbox health score: {score} percent', { score: health.score.toString() })}
          >
            {health.score}
          </Text>
          <View 
            style={styles.trendBadge}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={health.trend === 'up' ? 'Trending up' : 'Trending down'}
          >
            {health.trend === 'up' ? (
              <TrendingUp size={16} color={colors.success} />
            ) : (
              <TrendingDown size={16} color={colors.danger} />
            )}
          </View>
        </View>
      </View>
      
      <View 
        style={styles.progressBar}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={formatAccessibilityLabel('Inbox health progress: {score} percent', { score: health.score.toString() })}
        accessibilityValue={{
          min: 0,
          max: 100,
          now: health.score,
        }}
      >
        <View style={[styles.progressFill, { width: `${health.score}%` }]} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          testID="stat-unread"
          icon={Mail}
          value={health.unreadCount.toLocaleString()}
          label="Unread"
          onPress={() => router.push({ pathname: '/stat-details', params: { type: 'unread' } })}
          accessibilityLabel={formatAccessibilityLabel('Unread messages: {count}', { count: health.unreadCount.toLocaleString() })}
          accessibilityHint="Opens detailed view of unread messages"
          style={styles.statItem}
        />
        <StatCard
          testID="stat-noise"
          icon={Archive}
          value={`${health.noisePercentage}%`}
          label="Noise"
          onPress={() => router.push({ pathname: '/stat-details', params: { type: 'noise' } })}
          accessibilityLabel={formatAccessibilityLabel('Noise sources: {percentage} percent', { percentage: health.noisePercentage.toString() })}
          accessibilityHint="Opens detailed view of noise sources"
          style={styles.statItem}
        />
        <StatCard
          testID="stat-files"
          icon={HardDrive}
          value={health.largeAttachmentsCount}
          label="Large Files"
          onPress={() => router.push({ pathname: '/stat-details', params: { type: 'files' } })}
          accessibilityLabel={formatAccessibilityLabel('Large files: {count}', { count: health.largeAttachmentsCount.toString() })}
          accessibilityHint="Opens detailed view of large file attachments"
          style={styles.statItem}
        />
        <StatCard
          testID="stat-automated"
          icon={Sparkles}
          value={`${health.automationCoverage}%`}
          label="Automated"
          onPress={() => router.push({ pathname: '/stat-details', params: { type: 'automated' } })}
          accessibilityLabel={formatAccessibilityLabel('Automation coverage: {percentage} percent', { percentage: health.automationCoverage.toString() })}
          accessibilityHint="Opens detailed view of automation coverage"
          style={styles.statItem}
        />
      </View>
    </LinearGradient>
  );
}


