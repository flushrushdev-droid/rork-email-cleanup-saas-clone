import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { Mail, Bell, Database, FileText, HelpCircle, LogOut, ChevronRight, Check, Moon, History, Lightbulb, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [featureRequestModalVisible, setFeatureRequestModalVisible] = React.useState(false);
  const [featureTitle, setFeatureTitle] = React.useState('');
  const [featureDescription, setFeatureDescription] = React.useState('');
  const [successMessageVisible, setSuccessMessageVisible] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleSendFeatureRequest = () => {
    if (!featureTitle.trim() || !featureDescription.trim()) {
      Alert.alert('Missing Information', 'Please provide both a title and description for your feature request.');
      return;
    }
    
    // Close the form modal
    setFeatureRequestModalVisible(false);
    
    // Clear the form
    setFeatureTitle('');
    setFeatureDescription('');
    
    // Show success message
    setSuccessMessageVisible(true);
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessageVisible(false);
    }, 3000);
  };

  const handleCancelFeatureRequest = () => {
    setFeatureRequestModalVisible(false);
    setFeatureTitle('');
    setFeatureDescription('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your preferences</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Account</Text>
          {user && (
            <View style={[styles.accountCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.accountIcon, { backgroundColor: colors.primary + '20' }]}>
                <Mail size={24} color={colors.primary} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={[styles.accountName, { color: colors.text }]}>{user.name || 'Google Account'}</Text>
                <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.statusText, { color: colors.success }]}>Connected • Google</Text>
                </View>
              </View>
              <Check size={20} color={colors.success} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.text + '20' }]}>
                <Moon size={20} color={colors.text} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Switch between light and dark theme</Text>
              </View>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.info + '20' }]}> 
                <Bell size={20} color={colors.info} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Get alerts for important emails</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(v) => {
                setNotificationsEnabled(v);
                Alert.alert('Notifications', v ? 'Enabled' : 'Disabled');
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security & Privacy</Text>
          
          <TouchableOpacity testID="menu-data" style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => Alert.alert('Data Management', 'Coming soon')}>
            <View style={[styles.menuIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Database size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Data Management</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity testID="menu-history" style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/history')}>
            <View style={[styles.menuIcon, { backgroundColor: '#8E8E93' + '20' }]}>
              <History size={20} color="#8E8E93" />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>History</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          
          <TouchableOpacity testID="menu-help" style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => Alert.alert('Help', 'Visit our docs at help.example.com')}>
            <View style={[styles.menuIcon, { backgroundColor: colors.info + '20' }]}> 
              <HelpCircle size={20} color={colors.info} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Help & Documentation</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity testID="menu-feature-request" style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => setFeatureRequestModalVisible(true)}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFA500' + '20' }]}> 
              <Lightbulb size={20} color="#FFA500" />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Feature Request</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity testID="menu-terms" style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => Alert.alert('Terms & Privacy', 'Read our policy on example.com/policy')}>
            <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + '20' }]}>
              <FileText size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Terms & Privacy Policy</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
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

        <TouchableOpacity testID="logout" style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.danger }]} onPress={handleSignOut}>
          <LogOut size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>AthenX Mail v1.0.0</Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Made with ❤️ for productivity</Text>
        </View>

      </ScrollView>

      {/* Feature Request Modal */}
      <Modal
        visible={featureRequestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancelFeatureRequest}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Feature Request</Text>
              <TouchableOpacity onPress={handleCancelFeatureRequest}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Brief title for your feature request"
                placeholderTextColor={colors.textSecondary}
                value={featureTitle}
                onChangeText={setFeatureTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Describe your feature idea in detail..."
                placeholderTextColor={colors.textSecondary}
                value={featureDescription}
                onChangeText={setFeatureDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={handleCancelFeatureRequest}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton, { backgroundColor: colors.primary }]}
                onPress={handleSendFeatureRequest}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Message Modal */}
      <Modal
        visible={successMessageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessMessageVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={[styles.successContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <Check size={32} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Thank You!</Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              We truly appreciate your feedback. Our team will review your feature request and work hard to bring your ideas to life!
            </Text>
            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: colors.primary }]}
              onPress={() => setSuccessMessageVisible(false)}
            >
              <Text style={styles.successButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 12,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 13,
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
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    width: '100%',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  sendButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
