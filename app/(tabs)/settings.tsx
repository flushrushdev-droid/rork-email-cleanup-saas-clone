import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Mail, Bell, Database, FileText, HelpCircle, LogOut, ChevronRight, Moon, History, Lightbulb, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createSettingsStyles } from '@/styles/app/settings';
import { FeatureRequestModal } from '@/components/settings/FeatureRequestModal';
import { FeatureRequestSuccessModal } from '@/components/settings/FeatureRequestSuccessModal';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();
  const styles = React.useMemo(() => createSettingsStyles(colors), [colors]);
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

      <FeatureRequestModal
        visible={featureRequestModalVisible}
        title={featureTitle}
        description={featureDescription}
        onTitleChange={setFeatureTitle}
        onDescriptionChange={setFeatureDescription}
        onClose={handleCancelFeatureRequest}
        onSubmit={handleSendFeatureRequest}
        colors={colors}
      />

      <FeatureRequestSuccessModal
        visible={successMessageVisible}
        onClose={() => setSuccessMessageVisible(false)}
        colors={colors}
      />
    </View>
  );
}

