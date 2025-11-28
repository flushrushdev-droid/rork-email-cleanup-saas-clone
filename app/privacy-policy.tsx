import React from 'react';
import { View, ScrollView } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleOpenInBrowser = async () => {
    // In a real app, this would open the privacy policy on your website
    // For now, we'll show the content in-app
    // You can replace this with: await WebBrowser.openBrowserAsync('https://yourwebsite.com/privacy');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Privacy Policy"
        subtitle={`Last Updated: ${new Date().toLocaleDateString()}`}
        onBack={() => router.back()}
        insets={insets}
      />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 24 }}>
          {/* Introduction */}
          <View>
            <AppText
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 12 }}
              dynamicTypeStyle="headline"
            >
              Introduction
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24 }} dynamicTypeStyle="body">
              AthenX Mail ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </AppText>
          </View>

          {/* Information We Collect */}
          <View>
            <AppText
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 12 }}
              dynamicTypeStyle="headline"
            >
              Information We Collect
            </AppText>
            
            <AppText
              style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8, marginBottom: 8 }}
              dynamicTypeStyle="body"
            >
              Information You Provide
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24, marginBottom: 12 }} dynamicTypeStyle="body">
              • Email Address: We collect your email address when you connect your Gmail account through Google OAuth authentication.{'\n'}
              • User Preferences: We store your app preferences such as theme settings (light/dark mode) and notification preferences locally on your device.
            </AppText>

            <AppText
              style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8, marginBottom: 8 }}
              dynamicTypeStyle="body"
            >
              Information Automatically Collected
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24, marginBottom: 12 }} dynamicTypeStyle="body">
              • Email Content: We temporarily access and display your email messages, subject lines, senders, and metadata through the Gmail API to provide email management functionality.{'\n'}
              • OAuth Tokens: We securely store authentication tokens provided by Google OAuth to maintain your session and access Gmail on your behalf.
            </AppText>

            <AppText
              style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8, marginBottom: 8 }}
              dynamicTypeStyle="body"
            >
              Information from Third Parties
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24 }} dynamicTypeStyle="body">
              • Google Account Information: When you authenticate with Google, we receive basic profile information (name, email, profile picture) that you have authorized us to access.
            </AppText>
          </View>

          {/* How We Use Your Information */}
          <View>
            <AppText
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 12 }}
              dynamicTypeStyle="headline"
            >
              How We Use Your Information
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24 }} dynamicTypeStyle="body">
              We use the information we collect to:{'\n'}
              • Provide Email Management Services: Access and manage your Gmail inbox, including reading, organizing, and managing your emails.{'\n'}
              • Authenticate Your Account: Maintain secure authentication sessions using OAuth tokens.{'\n'}
              • Improve User Experience: Store your preferences to personalize the app experience.{'\n'}
              • Provide Support: Respond to your inquiries and provide customer support.
            </AppText>
          </View>

          {/* Data Storage and Security */}
          <View>
            <AppText
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 12 }}
              dynamicTypeStyle="headline"
            >
              Data Storage and Security
            </AppText>
            
            <AppText
              style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8, marginBottom: 8 }}
              dynamicTypeStyle="body"
            >
              Local Storage
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24, marginBottom: 12 }} dynamicTypeStyle="body">
              • Secure Storage: OAuth tokens and authentication credentials are stored securely using device-level encryption (SecureStore) and are never stored in plain text.{'\n'}
              • User Preferences: Non-sensitive preferences are stored locally on your device using standard storage mechanisms.
            </AppText>

            <AppText
              style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8, marginBottom: 8 }}
              dynamicTypeStyle="body"
            >
              Data Transmission
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24, marginBottom: 12 }} dynamicTypeStyle="body">
              • Encryption: All data transmitted between the app and our servers or Google APIs is encrypted using HTTPS/TLS protocols.{'\n'}
              • Secure Authentication: We use industry-standard OAuth 2.0 authentication with PKCE (Proof Key for Code Exchange) for enhanced security.
            </AppText>

            <AppText
              style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 8, marginBottom: 8 }}
              dynamicTypeStyle="body"
            >
              Data Retention
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24 }} dynamicTypeStyle="body">
              • Active Sessions: Authentication tokens are retained only while you are actively using the app and are automatically removed when you sign out.{'\n'}
              • Local Preferences: Your app preferences are stored locally on your device until you uninstall the app or clear app data.
            </AppText>
          </View>

          {/* Data Sharing */}
          <View>
            <AppText
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 12 }}
              dynamicTypeStyle="headline"
            >
              Data Sharing and Disclosure
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24, marginBottom: 12 }} dynamicTypeStyle="body">
              • Google APIs: We share necessary information with Google APIs (Gmail API) to provide email management functionality. This sharing is governed by Google's Privacy Policy and Terms of Service.{'\n'}
              • No Sale of Data: We do not sell, rent, or trade your personal information to third parties.
            </AppText>
          </View>

          {/* Your Rights */}
          <View>
            <AppText
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 12 }}
              dynamicTypeStyle="headline"
            >
              Your Rights and Choices
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24 }} dynamicTypeStyle="body">
              • Account Access: You can access your account information through the app settings.{'\n'}
              • Data Deletion: You can delete your account and associated data by signing out of the app.{'\n'}
              • Revoke Access: You can revoke our access to your Gmail account at any time through your Google Account settings.
            </AppText>
          </View>

          {/* Contact */}
          <View>
            <AppText
              style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 12 }}
              dynamicTypeStyle="headline"
            >
              Contact Us
            </AppText>
            <AppText style={{ color: colors.text, lineHeight: 24 }} dynamicTypeStyle="body">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through the app's support section or visit our website.
            </AppText>
          </View>

          {/* Note */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: colors.info,
            }}
          >
            <AppText
              style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}
              dynamicTypeStyle="caption"
            >
              Note
            </AppText>
            <AppText style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18 }} dynamicTypeStyle="caption">
              This Privacy Policy is designed to comply with GDPR, CCPA, and COPPA regulations. Your use of Google services is also governed by Google's Privacy Policy and Terms of Service.
            </AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

