import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../hooks/useTheme';
import { ElectronicsSerialItem } from '../types';
import { CommonFormCard } from '../../common/components/CommonFormCard';

interface ElectronicsSerialSectionProps {
  serialNumbers: ElectronicsSerialItem[];
  onChangeSerials: (updated: ElectronicsSerialItem[]) => void;
  isMobileDevice?: boolean;
}

export const ElectronicsSerialSection: React.FC<ElectronicsSerialSectionProps> = ({
  serialNumbers,
  onChangeSerials,
  isMobileDevice = true,
}) => {
  const { colors, brandColors } = useTheme();

  const handleAddSerial = () => {
    const nextIdx = serialNumbers.length + 1;
    const newItem: ElectronicsSerialItem = {
      serialNumber: `SN${Date.now().toString().slice(-6)}${nextIdx}`,
      imeiNumber: isMobileDevice ? '' : undefined,
      status: 'available',
    };
    onChangeSerials([...serialNumbers, newItem]);
  };

  const handleUpdate = (index: number, field: keyof ElectronicsSerialItem, val: string) => {
    const updated = [...serialNumbers];
    updated[index] = { ...updated[index], [field]: val };
    onChangeSerials(updated);
  };

  const handleDelete = (index: number) => {
    const updated = serialNumbers.filter((_, i) => i !== index);
    onChangeSerials(updated);
  };

  return (
    <CommonFormCard
      title="Serial & IMEI Inventory Tracking"
      subtitle="Track each physical serialized unit for warranty activation & POS checkout"
      icon="barcode-outline"
    >
      <View style={styles.headerRow}>
        <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
          Tracked Serial Units: {serialNumbers.length}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: brandColors.primary }]}
          onPress={handleAddSerial}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Serial Unit</Text>
        </TouchableOpacity>
      </View>

      {serialNumbers.length === 0 ? (
        <View style={[styles.emptyBox, { borderColor: colors.border }]}>
          <Ionicons name="scan-outline" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No serialized units added yet. Click &quot;Add Serial Unit&quot; or scan during stock intake.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={[styles.row, styles.tableHeader, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.th, { width: 140, color: colors.textSecondary }]}>Serial Number</Text>
              {isMobileDevice && (
                <Text style={[styles.th, { width: 150, color: colors.textSecondary }]}>IMEI 1 (15 digits)</Text>
              )}
              <Text style={[styles.th, { width: 90, color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.th, { width: 50, textAlign: 'center', color: colors.textSecondary }]}>Del</Text>
            </View>

            {serialNumbers.map((s, idx) => (
              <View
                key={s.id || idx}
                style={[
                  styles.row,
                  { borderBottomColor: colors.border },
                  idx % 2 === 1 && { backgroundColor: colors.surface + '60' },
                ]}
              >
                <View style={[styles.td, { width: 140 }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="SN12345678"
                    placeholderTextColor={colors.textMuted}
                    value={s.serialNumber}
                    onChangeText={(val) => handleUpdate(idx, 'serialNumber', val)}
                  />
                </View>

                {isMobileDevice && (
                  <View style={[styles.td, { width: 150 }]}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                      placeholder="869403049182374"
                      placeholderTextColor={colors.textMuted}
                      value={s.imeiNumber || ''}
                      onChangeText={(val) => handleUpdate(idx, 'imeiNumber', val)}
                      keyboardType="number-pad"
                      maxLength={15}
                    />
                  </View>
                )}

                <View style={[styles.td, { width: 90 }]}>
                  <View style={[styles.statusBadge, { backgroundColor: brandColors.successLight }]}>
                    <Text style={[styles.statusText, { color: brandColors.success }]}>{s.status || 'available'}</Text>
                  </View>
                </View>

                <View style={[styles.td, { width: 50, alignItems: 'center' }]}>
                  <TouchableOpacity onPress={() => handleDelete(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={17} color={brandColors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </CommonFormCard>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  table: {
    minWidth: 440,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableHeader: {
    paddingVertical: 10,
    borderRadius: 6,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  td: {
    paddingHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});

