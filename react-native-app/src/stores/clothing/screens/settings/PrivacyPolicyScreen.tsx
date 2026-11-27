import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppIcon from '../../components/icons/AppIcon';

const SECTIONS = [
  {
    title: '1. Introduction',
    body: 'Welcome to Tulsi Mart, an all-in-one store management, POS billing, and customer Khata ledger application. This Privacy Policy describes how Tulsi Mart protects the confidentiality and security of store owners and their customer records.',
  },
  {
    title: '2. Information We Collect',
    bullets: [
      'Merchant Profile: Store owner name, phone number, email address, store name, store category, and secure authentication tokens.',
      'Business & Tax Info: Store address, GSTIN/PAN details, and document numbering prefixes.',
      'Catalog & Inventory: Product specifications, batch/variant metadata, purchase/selling prices, and real-time stock quantities.',
      'Transactions & Khata: POS invoices, payment methods (Cash, UPI, Card, Khata), and ledger settlements.',
    ],
  },
  {
    title: '3. How Your Data Is Used',
    bullets: [
      'Generating GST-ready invoices, receipts, and store business reports.',
      'Tracking store expenses, supplier purchases, and inventory valuation.',
      'Managing customer credit/debit Khata balances and payment histories.',
      'Delivering timely low-stock and expiry notifications inside the application.',
    ],
  },
  {
    title: '4. Multi-Store Data Isolation & Security',
    bullets: [
      'Strict Store Isolation: Every merchant store is isolated at the API and database layer by store ID.',
      'Encrypted Transport: All network traffic uses HTTPS/TLS encryption.',
      'Protected Authentication: Passwords are cryptographically hashed and sessions are protected with signed JWT tokens.',
    ],
  },
  {
    title: '5. Ownership & Contact',
    body: 'All business data entered into Tulsi Mart belongs exclusively to your store. We never sell or share customer lists with third-party advertisers. For privacy inquiries, contact Tulsi Mart Support from App Settings.',
  },
];

export const PrivacyPolicyScreen: React.FC = () => {
  const { colors, brandColors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Privacy Policy"
        showBack
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.banner,
            {
              backgroundColor: isDark ? colors.badgeOrangeBg : brandColors.lightOrange,
              borderColor: brandColors.primaryOrange,
            },
          ]}
        >
          <View style={[styles.shieldBox, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <AppIcon name="shield" size={24} color={brandColors.primaryOrange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.bannerTitle,
                { color: isDark ? colors.badgeOrangeText : brandColors.darkOrange },
              ]}
            >
              Your Business Privacy Comes First
            </Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              Last updated November 2026 • Tulsi Mart Security Standard
            </Text>
          </View>
        </View>

        {SECTIONS.map((sec) => (
          <AppCard key={sec.title} style={styles.sectionCard}>
            <Text style={[styles.sectionHeading, { color: brandColors.primaryOrange }]}>
              {sec.title}
            </Text>
            {sec.body ? (
              <Text style={[styles.bodyText, { color: colors.textPrimary }]}>{sec.body}</Text>
            ) : null}
            {sec.bullets ? (
              <View style={styles.bulletList}>
                {sec.bullets.map((b, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: brandColors.primaryOrange }]} />
                    <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{b}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </AppCard>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 36 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  shieldBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 15, fontWeight: '800' },
  bannerSub: { fontSize: 12, marginTop: 2 },
  sectionCard: { marginBottom: 10 },
  sectionHeading: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  bodyText: { fontSize: 13.5, lineHeight: 20 },
  bulletList: { gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 19 },
});

export default PrivacyPolicyScreen;
