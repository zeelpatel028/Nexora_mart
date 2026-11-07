import React, { useState, useEffect } from 'react';
import { storeService, authService } from '../../services';

export const ProfileView = ({ user, onUserUpdated, onLogout }) => {
  const [store, setStore] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [savingStore, setSavingStore] = useState(false);
  const [storeMsg, setStoreMsg] = useState({ text: '', type: '' });

  const [firstName, setFirstName] = useState(user?.first_name || user?.firstName || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [userMsg, setUserMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadStore() {
      try {
        const s = await storeService.getMyStore();
        if (s) {
          setStore(s);
          setStoreName(s.name || '');
          setStorePhone(s.phone || '');
          setStoreAddress(s.address || '');
          setStoreCity(s.city || '');
        }
      } catch (err) {
        console.warn('Profile store load notice:', err);
      }
    }
    loadStore();
  }, []);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || user.firstName || '');
      setSurname(user.surname || '');
      setUserPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    setSavingStore(true);
    setStoreMsg({ text: '', type: '' });
    try {
      const updated = await storeService.updateMyStore({
        name: storeName.trim() || undefined,
        phone: storePhone.trim() || undefined,
        address: storeAddress.trim() || undefined,
        city: storeCity.trim() || undefined,
      });
      setStore(updated);
      setStoreMsg({ text: 'Store profile saved successfully.', type: 'success' });
    } catch (err) {
      setStoreMsg({ text: err.message || 'Failed to update store.', type: 'danger' });
    } finally {
      setSavingStore(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    setUserMsg({ text: '', type: '' });
    try {
      const updatedUser = await authService.updateProfile({
        firstName: firstName.trim() || undefined,
        surname: surname.trim() || undefined,
        phone: userPhone.trim() || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setUserMsg({ text: 'Personal account details updated.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      if (onUserUpdated) onUserUpdated(updatedUser);
    } catch (err) {
      setUserMsg({ text: err.message || 'Failed to update personal details.', type: 'danger' });
    } finally {
      setSavingUser(false);
    }
  };

  const fullName =
    user?.first_name || user?.surname
      ? `${user?.first_name || ''} ${user?.surname || ''}`.trim()
      : user?.name || 'Merchant Owner';

  return (
    <div className="profile-view-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* 1. Header Card matching React Native ProfileScreen */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-center bg-white">
        <div
          className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mb-3 shadow-sm"
          style={{ width: '72px', height: '72px', backgroundColor: '#FF6A1A', fontSize: '28px' }}
        >
          {fullName.charAt(0).toUpperCase()}
        </div>
        <h4 className="fw-bold mb-1 text-dark">{fullName}</h4>
        <p className="text-muted small mb-2">{user?.email}</p>
        <div className="d-flex justify-content-center gap-2">
          <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-1 rounded-pill fw-semibold">
            {user?.store_type || user?.storeType || 'Supermarket'}
          </span>
          <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-semibold">
            Store Merchant
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* 2. Personal Information Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <h5 className="fw-bold mb-3 text-dark">Personal Information</h5>

            {userMsg.text && (
              <div className={`alert alert-${userMsg.type} py-2 small mb-3`}>
                {userMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Surname</label>
                <input
                  type="text"
                  className="form-control"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Surname"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+1-555-0100"
                />
              </div>

              <div className="border-top pt-3 mt-3">
                <label className="form-label small fw-bold text-dark mb-2">Change Password (Optional)</label>
                <div className="mb-2">
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold"
                disabled={savingUser}
                style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
              >
                {savingUser ? 'Saving...' : 'Save Account Details'}
              </button>
            </form>
          </div>
        </div>

        {/* 3. Store Business Profile Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <h5 className="fw-bold mb-3 text-dark">Store Business Profile</h5>

            {storeMsg.text && (
              <div className={`alert alert-${storeMsg.type} py-2 small mb-3`}>
                {storeMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateStore}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Store Business Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Alex Morgan Supermarket"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Store Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="+1-555-0199"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="123 Commerce Way"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">City / Region</label>
                <input
                  type="text"
                  className="form-control"
                  value={storeCity}
                  onChange={(e) => setStoreCity(e.target.value)}
                  placeholder="e.g. New York, NY"
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-primary w-100 fw-semibold mt-auto"
                disabled={savingStore}
              >
                {savingStore ? 'Saving...' : 'Update Store Info'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="mt-4 pt-2 text-center">
        <button
          type="button"
          className="btn btn-outline-danger px-4 rounded-3 fw-semibold"
          onClick={onLogout}
        >
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default ProfileView;

