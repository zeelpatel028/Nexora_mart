import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MailIcon, LockIcon, UserIcon } from '../../components/branding/Icons';
import { authService } from '../../services';

export const CreateAccountModal = ({ isOpen, onClose, onRegistered }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(formData);
      setLoading(false);
      if (onRegistered) {
        onRegistered(formData.name || 'User');
      }
      onClose();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Modal
      id="create-account-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Create an Account"
      subtitle="Join Nmart today and start exploring."
      maxWidth="400px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <Input
            type="text"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<UserIcon size={19} color="#64748b" />}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <Input
            type="email"
            placeholder="Email address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<MailIcon size={19} color="#64748b" />}
          />
        </div>

        <div style={{ marginBottom: '22px' }}>
          <Input
            type="password"
            placeholder="Create password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={<LockIcon size={19} color="#64748b" />}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loading}
        >
          {loading ? 'Creating Account...' : 'Get Started'}
        </Button>
      </form>
    </Modal>
  );
};

export default CreateAccountModal;
