import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { storeService, authService } from '../../services';
import { Store } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout, refreshProfile } = useAuth();
  const { colors, brandColors } = useTheme();

  // Store profile fields
  const [store, setStore] = useState<Store | null>(null);
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [savingStore, setSavingStore] = useState(false);

  // User personal account fields
  const [firstName, setFirstName] = useState(user?.first_name || user?.firstName || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    async function loadStore() {
      try {
        const s = await storeService.getMyStore();
        setStore(s);
        setStoreName(s.name || '');
        setStorePhone(s.phone || '');
        setStoreAddress(s.address || '');
        setStoreCity(s.city || '');
      } catch (err) {
        console.warn('Failed to load store profile:', err);
      }
    }
    loadStore();
  }, []);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || (user as any).firstName || '');
      setSurname(user.surname || '');
      setUserPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateStore = async () => {
    setSavingStore(true);
    try {
      const updated = await storeService.updateMyStore({
        name: storeName.trim() || undefined,
        phone: storePhone.trim() || undefined,
        address: storeAddress.trim() || undefined,
        city: storeCity.trim() || undefined,
      });
      setStore(updated);
      await refreshProfile();
      Alert.alert('Store Updated', 'Your merchant store profile has been saved.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update store.');
    } finally {
      setSavingStore(false);
    }
  };

  const handleUpdateUserProfile = async () => {
    setSavingUser(true);
    try {
      await authService.updateProfile({
        firstName: firstName.trim() || undefined,
        surname: surname.trim() || undefined,
        phone: userPhone.trim() || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      await refreshProfile();
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Account Updated', 'Your merchant personal profile details have been saved.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of your merchant session?',
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

  const fullName =
    user?.first_name || user?.surname
      ? `${user?.first_name || ''} ${user?.surname || ''}`.trim()
      : user?.name || 'Merchant Owner';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Merchant Profile" subtitle="Account & Store identity" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Badge Card */}
        <Card style={styles.userCard}>
          <View style={[styles.avatarCircle, { backgroundColor: brandColors.primary }]}>
            <Text style={styles.avatarLetter}>
              {fullName.substring(0, 1).toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.userName, { color: colors.textPrimary }]}>{fullName}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <Badge label={user?.store_type || (user as any)?.storeType || 'Supermarket'} variant="primary" />
            <Badge label="Store Merchant" variant="success" />
          </View>
        </Card>

        {/* Personal Account Information */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Personal Information</Text>

          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />

          <Input
            label="Surname"
            value={surname}
            onChangeText={setSurname}
            placeholder="Surname"
          />

          <Input
            label="Contact Phone"
            value={userPhone}
            onChangeText={setUserPhone}
            placeholder="+1-555-0100"
            keyboardType="phone-pad"
          />

          <View style={{ marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={[styles.subHeading, { color: colors.textPrimary }]}>Security / Password (Optional)</Text>
            <Input
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Required to set new password"
              secureTextEntry
            />
            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Minimum 6 characters"
              secureTextEntry
            />
          </View>

          <Button
            title="Save Account Details"
            onPress={handleUpdateUserProfile}
            loading={savingUser}
            size="sm"
            style={{ marginTop: 6 }}
          />
        </Card>

        {/* Store Business Profile Form */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Store Profile</Text>

          <Input
            label="Store Business Name"
            value={storeName}
            onChangeText={setStoreName}
            placeholder="e.g. Alex Morgan Supermarket"
          />

          <Input
            label="Store Contact Phone"
            value={storePhone}
            onChangeText={setStorePhone}
            placeholder="+1-555-0199"
            keyboardType="phone-pad"
          />

          <Input
            label="Street Address"
            value={storeAddress}
            onChangeText={setStoreAddress}
            placeholder="123 Commerce Way"
          />

          <Input
            label="City / Region"
            value={storeCity}
            onChangeText={setStoreCity}
            placeholder="e.g. New York, NY"
          />

          <Button
            title="Update Store Info"
            onPress={handleUpdateStore}
            loading={savingStore}
            size="sm"
            style={{ marginTop: 6 }}
          />
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out from Device"
          variant="danger"
          onPress={handleLogout}
          style={{ marginTop: 4, marginBottom: 28 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 8,
  },
});

export default ProfileScreen;
