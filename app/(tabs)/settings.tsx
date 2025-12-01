import React from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Mail, Bell, Database, FileText, HelpCircle, LogOut, ChevronRight, Moon, History, Lightbulb, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createSettingsStyles } from '@/styles/app/settings';
import { FeatureRequestModal } from '@/components/settings/FeatureRequestModal';
import { FeatureRequestSuccessModal } from '@/components/settings/FeatureRequestSuccessModal';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

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
  const { showInfo } = useEnhancedToast();

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
        <AppText 
          style={[styles.title, { color: colors.text }]}
          accessibilityRole="header"
          accessibilityLabel="Settings"
          dynamicTypeStyle="title1"
        >
          Settings
        </AppText>
        <AppText 
          style={[styles.subtitle, { color: colors.textSecondary }]}
          accessibilityRole="text"
          dynamicTypeStyle="body"
        >
          Manage your preferences
        </AppText>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <AppText style={styles.sectionTitle} dynamicTypeStyle="headline">Connected Account</AppText>
          {user && (
            <View style={[styles.accountCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.accountIcon, { backgroundColor: colors.primary + '20' }]}>
                <Mail size={24} color={colors.primary} />
              </View>
              <View style={styles.accountInfo}>
                <AppText style={[styles.accountName, { color: colors.text }]} dynamicTypeStyle="headline">{user.name || 'Google Account'}</AppText>
                <AppText style={[styles.accountEmail, { color: colors.textSecondary }]} dynamicTypeStyle="body">{user.email}</AppText>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <AppText style={[styles.statusText, { color: colors.success }]} dynamicTypeStyle="caption">Connected • Google</AppText>
                </View>
              </View>
              <Check size={20} color={colors.success} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Preferences</AppText>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.text + '20' }]}>
                <Moon size={20} color={colors.text} />
              </View>
              <View style={styles.settingContent}>
                <AppText style={[styles.settingLabel, { color: colors.text }]} dynamicTypeStyle="body">Dark Mode</AppText>
                <AppText style={[styles.settingDescription, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Switch between light and dark theme</AppText>
              </View>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Dark Mode"
              accessibilityHint={`Toggle to ${theme === 'dark' ? 'disable' : 'enable'} dark mode`}
              accessibilityState={{ checked: theme === 'dark' }}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.info + '20' }]}> 
                <Bell size={20} color={colors.info} />
              </View>
              <View style={styles.settingContent}>
                <AppText style={[styles.settingLabel, { color: colors.text }]} dynamicTypeStyle="body">Notifications</AppText>
                <AppText style={[styles.settingDescription, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Get alerts for important emails</AppText>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(v) => {
                setNotificationsEnabled(v);
                showInfo(`Notifications ${v ? 'Enabled' : 'Disabled'}`, { duration: 2000 });
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Notifications"
              accessibilityHint={`Toggle to ${notificationsEnabled ? 'disable' : 'enable'} email notifications`}
              accessibilityState={{ checked: notificationsEnabled }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Security & Privacy</AppText>
          
          <TouchableOpacity 
            testID="menu-data" 
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Data Management"
            accessibilityHint="Double tap to manage your account data"
            style={[styles.menuItem, { backgroundColor: colors.surface }]} 
            onPress={() => showInfo('Data Management coming soon', { duration: 2000 })}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Database size={20} color={colors.secondary} />
            </View>
            <AppText style={[styles.menuLabel, { color: colors.text }]} dynamicTypeStyle="body">Data Management</AppText>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            testID="menu-history"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="History"
            accessibilityHint="Double tap to view your account history"
            style={[styles.menuItem, { backgroundColor: colors.surface }]} 
            onPress={() => router.push('/history')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + '20' }]}>
              <History size={20} color={colors.textSecondary} />
            </View>
            <AppText style={[styles.menuLabel, { color: colors.text }]} dynamicTypeStyle="body">History</AppText>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Support</AppText>
          
          <TouchableOpacity 
            testID="menu-help"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Help & Documentation"
            accessibilityHint="Double tap to view help and documentation"
            style={[styles.menuItem, { backgroundColor: colors.surface }]} 
            onPress={() => showInfo('Visit our docs at help.example.com', { duration: 3000 })}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.info + '20' }]}> 
              <HelpCircle size={20} color={colors.info} />
            </View>
            <AppText style={[styles.menuLabel, { color: colors.text }]} dynamicTypeStyle="body">Help & Documentation</AppText>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            testID="menu-feature-request"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Feature Request"
            accessibilityHint="Double tap to submit a feature request"
            style={[styles.menuItem, { backgroundColor: colors.surface }]} 
            onPress={() => setFeatureRequestModalVisible(true)}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.warning + '20' }]}> 
              <Lightbulb size={20} color={colors.warning} />
            </View>
            <AppText style={[styles.menuLabel, { color: colors.text }]} dynamicTypeStyle="body">Feature Request</AppText>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            testID="menu-terms"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Terms & Privacy Policy"
            accessibilityHint="Double tap to view terms and privacy policy"
            style={[styles.menuItem, { backgroundColor: colors.surface }]} 
            onPress={() => router.push('/privacy-policy')}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + '20' }]}>
              <FileText size={20} color={colors.textSecondary} />
            </View>
            <AppText style={[styles.menuLabel, { color: colors.text }]} dynamicTypeStyle="body">Terms & Privacy Policy</AppText>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[colors.danger, colors.category.social]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upgradeCard}
        >
          <View style={styles.upgradeContent}>
            <AppText style={styles.upgradeTitle} dynamicTypeStyle="title2">Upgrade to Pro</AppText>
            <AppText style={styles.upgradeDescription} dynamicTypeStyle="body">
              Unlimited accounts, advanced AI features, and priority support
            </AppText>
            <TouchableOpacity 
              testID="upgrade"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Pro"
              accessibilityHint="Double tap to upgrade to Pro version with unlimited accounts and advanced features"
              style={styles.upgradeButton} 
              onPress={() => showInfo('In-app purchases coming soon', { duration: 2000 })}
            >
              <AppText style={styles.upgradeButtonText} dynamicTypeStyle="headline">Upgrade Now</AppText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <TouchableOpacity 
          testID="logout"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Sign Out"
          accessibilityHint="Double tap to sign out of your account"
          style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.danger }]} 
          onPress={handleSignOut}
        >
          <LogOut size={20} color={colors.danger} />
          <AppText style={[styles.logoutText, { color: colors.danger }]} dynamicTypeStyle="headline">Sign Out</AppText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <AppText style={[styles.footerText, { color: colors.textSecondary }]} dynamicTypeStyle="caption">AthenX Mail v1.0.0</AppText>
          <AppText style={[styles.footerText, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Made with ❤️ for productivity</AppText>
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

