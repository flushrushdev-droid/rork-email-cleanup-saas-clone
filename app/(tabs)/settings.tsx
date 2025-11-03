import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Mail, Shield, Zap, Bell, Database, FileText, HelpCircle, LogOut, ChevronRight, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

import Colors from '@/constants/colors';
import { mockAccounts } from '@/mocks/emailData';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [autoCleanup, setAutoCleanup] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Account</Text>
          {user && (
            <View style={styles.accountCard}>
              <View style={styles.accountIcon}>
                <Mail size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{user.name || 'Google Account'}</Text>
                <Text style={styles.accountEmail}>{user.email}</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Connected • Google</Text>
                </View>
              </View>
              <Check size={20} color={Colors.light.success} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.info + '20' }]}> 
                <Bell size={20} color={Colors.light.info} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Get alerts for important emails</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(v) => {
                setNotificationsEnabled(v);
                Alert.alert('Notifications', v ? 'Enabled' : 'Disabled');
              }}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.warning + '20' }]}>
                <Zap size={20} color={Colors.light.warning} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Auto Cleanup</Text>
                <Text style={styles.settingDescription}>Automatically archive old emails</Text>
              </View>
            </View>
            <Switch
              value={autoCleanup}
              onValueChange={(v) => {
                setAutoCleanup(v);
                Alert.alert('Auto Cleanup', v ? 'Enabled' : 'Disabled');
              }}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Privacy</Text>
          
          <TouchableOpacity testID="menu-rules" style={styles.menuItem} onPress={() => router.push('/rules')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.light.success + '20' }]}>
              <Shield size={20} color={Colors.light.success} />
            </View>
            <Text style={styles.menuLabel}>Automation Rules</Text>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity testID="menu-data" style={styles.menuItem} onPress={() => Alert.alert('Data Management', 'Coming soon')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.light.secondary + '20' }]}>
              <Database size={20} color={Colors.light.secondary} />
            </View>
            <Text style={styles.menuLabel}>Data Management</Text>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity testID="menu-help" style={styles.menuItem} onPress={() => Alert.alert('Help', 'Visit our docs at help.example.com')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.light.info + '20' }]}> 
              <HelpCircle size={20} color={Colors.light.info} />
            </View>
            <Text style={styles.menuLabel}>Help & Documentation</Text>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity testID="menu-terms" style={styles.menuItem} onPress={() => Alert.alert('Terms & Privacy', 'Read our policy on example.com/policy')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.light.textSecondary + '20' }]}>
              <FileText size={20} color={Colors.light.textSecondary} />
            </View>
            <Text style={styles.menuLabel}>Terms & Privacy Policy</Text>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#FF3B30', '#FF6482']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upgradeCard}
        >
          <View style={styles.upgradeContent}>
            <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeDescription}>
              Unlimited accounts, advanced AI features, and priority support
            </Text>
            <TouchableOpacity testID="upgrade" style={styles.upgradeButton} onPress={() => Alert.alert('Upgrade', 'In-app purchases coming soon')}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <TouchableOpacity testID="logout" style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.light.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>InboxAI v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for productivity</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.success,
  },
  statusText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  upgradeCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  upgradeContent: {
    gap: 12,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  upgradeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.danger,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.danger,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
