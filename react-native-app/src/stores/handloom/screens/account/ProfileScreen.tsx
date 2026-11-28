import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '../../hooks/useFocusEffect';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useScreenSystemBar } from '../../utils/systemBar';
import { storeService, authService } from '../../services';
import { Store } from '../../../../api/types';
import AppHeader from '../../components/layout/AppHeader';
import {
  UserIcon,
  BuildingIcon,
  SettingsIcon,
  ShieldCheckIcon,
  InfoIcon,
  LogOutIcon,
  ChevronRightIcon,
  CloseIcon,
  PhoneIcon,
  MailIcon,
  StoreIcon,
  EditIcon,
} from '../../components/branding/Icons';

type AccountNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<AccountNavProp>();
  const { user, store: authStore, logout, refreshProfile } = useAuth();
  const { colors, brandColors, isDark } = useTheme();

  // Dynamic status bar sync
  useScreenSystemBar('white');

  const [store, setStore] = useState<Store | null>(authStore);
  const [loading, setLoading] = useState(false);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStoreName, setEditStoreName] = useState('');
  const [saving, setSaving] = useState(false);

  // About App Modal
  const [showAboutModal, setShowAboutModal] = useState(false);

  const loadData = async () => {
    try {
      const s = await storeService.getMyStore().catch(() => null);
      if (s) setStore(s);
    } catch (err) {
      console.warn('Failed to load store profile:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const openEditModal = () => {
    setEditFirstName(user?.first_name || (user as any)?.firstName || '');
    setEditSurname(user?.surname || '');
    setEditPhone(user?.phone || '');
    setEditStoreName(store?.name || authStore?.name || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (editStoreName.trim() && editStoreName !== store?.name) {
        await storeService.updateMyStore({ name: editStoreName.trim() });
        const updated = await storeService.getMyStore();
        if (updated) setStore(updated);
      }

      await authService.updateProfile({
        firstName: editFirstName.trim() || undefined,
        surname: editSurname.trim() || undefined,
        phone: editPhone.trim() || undefined,
      });

      await refreshProfile();
      setShowEditModal(false);
      Alert.alert('Profile Saved', 'Your account details have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Tulsi Mart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const userName =
    [user?.first_name || (user as any)?.firstName, user?.surname]
      .filter(Boolean)
      .join(' ') ||
    user?.name ||
    'Store Owner';

  const userInitials = (userName || 'TM')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const currentStoreName = store?.name || authStore?.name || 'Tulsi Mart';

  // Account Navigation Sections
  const accountCards = [
    {
      id: 'account_details',
      title: 'Account Details',
      icon: UserIcon,
      iconColor: brandColors.primary,
      onPress: () => navigation.navigate('AccountDetail'),
    },
    {
      id: 'business_details',
      title: 'Business Details',
      icon: BuildingIcon,
      iconColor: '#3B82F6',
      onPress: () => navigation.navigate('AccountDetail'),
    },
    {
      id: 'app_settings',
      title: 'App Settings',
      icon: SettingsIcon,
      iconColor: '#8B5CF6',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 'privacy_policy',
      title: 'Privacy Policy',
      icon: ShieldCheckIcon,
      iconColor: '#10B981',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: 'about_app',
      title: 'About App',
      icon: InfoIcon,
      iconColor: '#F59E0B',
      onPress: () => setShowAboutModal(true),
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: LogOutIcon,
      iconColor: '#EF4444',
      isDanger: true,
      onPress: handleLogout,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Top Header */}
      <AppHeader title="Store Information" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Top Profile Summary Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.profileRow}>
            {/* Avatar Circle */}
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: isDark ? '#261C16' : '#FFF3E0',
                  borderColor: brandColors.primary,
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: brandColors.primary }]}>
                {userInitials || 'O'}
              </Text>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                {userName}
              </Text>

              {user?.email ? (
                <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}

              {user?.phone ? (
                <Text style={[styles.userPhone, { color: colors.textSecondary }]} numberOfLines={1}>
                  {user.phone}
                </Text>
              ) : null}

              {/* Store Tag */}
              <View
                style={[
                  styles.storeTag,
                  {
                    backgroundColor: isDark ? '#261C16' : '#FFF3E0',
                    borderColor: brandColors.primary,
                  },
                ]}
              >
                <StoreIcon size={12} color={brandColors.primary} />
                <Text style={[styles.storeTagText, { color: brandColors.darkOrange }]} numberOfLines={1}>
                  {currentStoreName}
                </Text>
              </View>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={[
                styles.editBtn,
                {
                  backgroundColor: isDark ? '#261C16' : '#FFF3E0',
                  borderColor: brandColors.primary,
                },
              ]}
              onPress={openEditModal}
              accessibilityLabel="Edit Profile"
            >
              <EditIcon size={16} color={brandColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Account Navigation Cards */}
        <View style={styles.cardsContainer}>
          {accountCards.map((card) => {
            const Icon = card.icon;
            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.navCard,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={card.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.cardIconBox,
                    {
                      backgroundColor: isDark ? '#261C16' : '#FFF3E0',
                    },
                  ]}
                >
                  <Icon size={18} color={card.iconColor} strokeWidth={2.2} />
                </View>

                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: card.isDanger ? '#EF4444' : colors.textPrimary,
                    },
                  ]}
                >
                  {card.title}
                </Text>

                <ChevronRightIcon size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.editModalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Edit Account Profile
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <CloseIcon size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  First Name
                </Text>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  placeholder="Enter first name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Surname
                </Text>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={editSurname}
                  onChangeText={setEditSurname}
                  placeholder="Enter surname"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Phone Number
                </Text>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Store / Business Name
                </Text>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={editStoreName}
                  onChangeText={setEditStoreName}
                  placeholder="Enter store name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: brandColors.primary },
                  saving && { opacity: 0.7 },
                ]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* About App Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.aboutModalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                About Tulsi Mart
              </Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <CloseIcon size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.aboutContent}>
              <View
                style={[
                  styles.aboutLogoBox,
                  { backgroundColor: isDark ? '#261C16' : '#FFF3E0' },
                ]}
              >
                <StoreIcon size={36} color={brandColors.primary} />
              </View>

              <Text style={[styles.aboutAppName, { color: colors.textPrimary }]}>
                Tulsi Mart
              </Text>
              <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>
                Version 1.0.0 (Production)
              </Text>

              <Text style={[styles.aboutDescription, { color: colors.textSecondary }]}>
                Professional Retail Store Management & Indian Khata Book System for Indian merchants.
              </Text>

              <View style={[styles.aboutInfoRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.aboutInfoLabel, { color: colors.textSecondary }]}>
                  Platform
                </Text>
                <Text style={[styles.aboutInfoValue, { color: colors.textPrimary }]}>
                  Android Native React Native
                </Text>
              </View>

              <View style={[styles.aboutInfoRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.aboutInfoLabel, { color: colors.textSecondary }]}>
                  Currency
                </Text>
                <Text style={[styles.aboutInfoValue, { color: colors.textPrimary }]}>
                  Indian Rupee (₹)
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    marginBottom: 4,
  },
  storeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2,
  },
  storeTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    gap: 10,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  editModalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    maxHeight: '85%',
  },
  aboutModalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputField: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveBtn: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  aboutContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutLogoBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  aboutAppName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 12,
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  aboutInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  aboutInfoLabel: {
    fontSize: 13,
  },
  aboutInfoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ProfileScreen;
