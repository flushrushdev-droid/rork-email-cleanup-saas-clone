import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Search, BellOff, CheckCircle, XCircle, Clock, Mail, AlertCircle, X } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { UnsubscribeModal } from '@/components/common/UnsubscribeModal';
import { SuccessModal } from '@/components/common/SuccessModal';
import { UnsubscribeSenderCard } from '@/components/unsubscribe/UnsubscribeSenderCard';
import { UnsubscribeHistoryCard } from '@/components/unsubscribe/UnsubscribeHistoryCard';
import { useUnsubscribe } from '@/hooks/useUnsubscribe';
import { createUnsubscribeStyles } from '@/styles/app/unsubscribe';

export default function UnsubscribeManagerScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createUnsubscribeStyles(colors), [colors]);
  
  const {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    unsubscribeModalVisible,
    setUnsubscribeModalVisible,
    unsubscribeEmail,
    successModalVisible,
    setSuccessModalVisible,
    unsubscribeHistory,
    availableSenders,
    handleUnsubscribe,
    confirmUnsubscribe,
    getStatusIcon,
    getStatusColor,
  } = useUnsubscribe(colors);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Unsubscribe Manager',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Unsubscribe Manager</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Take control of your inbox</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search senders..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: colors.surface }, selectedTab === 'available' && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedTab('available')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'available' ? '#FFFFFF' : colors.text }]}>
              Available ({availableSenders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: colors.surface }, selectedTab === 'history' && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedTab('history')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'history' ? '#FFFFFF' : colors.text }]}>
              History ({unsubscribeHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {selectedTab === 'available' ? (
            <>
              <View style={[styles.infoCard, { backgroundColor: colors.info + '15' }]}>
                <AlertCircle size={20} color={colors.info} />
                <Text style={[styles.infoText, { color: colors.info }]}>
                  One-click unsubscribe with automatic fallback to polite email templates
                </Text>
              </View>

              {availableSenders.map((sender) => (
                <UnsubscribeSenderCard
                  key={sender.id}
                  sender={sender}
                  onUnsubscribe={handleUnsubscribe}
                  colors={colors}
                />
              ))}
            </>
          ) : (
            <>
              {unsubscribeHistory.map((item) => (
                <UnsubscribeHistoryCard
                  key={item.id}
                  item={item}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  colors={colors}
                />
              ))}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        <UnsubscribeModal
          visible={unsubscribeModalVisible}
          email={unsubscribeEmail}
          onConfirm={confirmUnsubscribe}
          onCancel={() => setUnsubscribeModalVisible(false)}
          colors={colors}
        />

        <SuccessModal
          visible={successModalVisible}
          title="Success!"
          message={`You have been unsubscribed from ${unsubscribeEmail}`}
          onClose={() => setSuccessModalVisible(false)}
          colors={colors}
        />
      </SafeAreaView>
    </>
  );
}

