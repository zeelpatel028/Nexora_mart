import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BillDateFilter } from '../types';
import { formatCurrency } from '../../../utils/formatters';

interface BillDateFilterBarProps {
  currentFilter: BillDateFilter;
  onSelectFilter: (filter: BillDateFilter) => void;
  summary?: {
    count: number;
    totalAmount: number;
  };
}

const formatDateYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getTodayStr = () => formatDateYMD(new Date());

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateYMD(d);
};

export const BillDateFilterBar: React.FC<BillDateFilterBarProps> = ({
  currentFilter,
  onSelectFilter,
  summary,
}) => {
  const { colors, brandColors } = useTheme();
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(currentFilter.dateStr || getTodayStr());

  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();

  const handleSelectToday = () => {
    onSelectFilter({
      type: 'today',
      dateStr: todayStr,
      label: 'Today',
    });
  };

  const handleSelectYesterday = () => {
    onSelectFilter({
      type: 'yesterday',
      dateStr: yesterdayStr,
      label: 'Yesterday',
    });
  };

  const handleSelectWeek = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    onSelectFilter({
      type: 'week',
      startDateStr: formatDateYMD(start),
      endDateStr: formatDateYMD(end),
      label: 'This Week',
    });
  };

  const handleSelectAll = () => {
    onSelectFilter({
      type: 'all',
      label: 'All Bills',
    });
  };

  const handleApplyCustomDate = () => {
    if (!customDateInput.trim()) return;
    onSelectFilter({
      type: 'custom',
      dateStr: customDateInput.trim(),
      label: customDateInput.trim(),
    });
    setCustomModalVisible(false);
  };

  const shiftDay = (delta: number) => {
    const baseStr = currentFilter.dateStr || todayStr;
    const parts = baseStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setDate(d.getDate() + delta);
      const newStr = formatDateYMD(d);
      const isToday = newStr === todayStr;
      const isYest = newStr === yesterdayStr;
      onSelectFilter({
        type: isToday ? 'today' : isYest ? 'yesterday' : 'custom',
        dateStr: newStr,
        label: isToday ? 'Today' : isYest ? 'Yesterday' : newStr,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
      {/* Quick Filter Horizontal Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            currentFilter.type === 'today'
              ? [styles.chipActive, { backgroundColor: brandColors.primary, borderColor: brandColors.primary }]
              : [styles.chipInactive, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }],
          ]}
          onPress={handleSelectToday}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              { color: currentFilter.type === 'today' ? '#FFF' : colors.textPrimary },
            ]}
          >
            🌟 Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            currentFilter.type === 'yesterday'
              ? [styles.chipActive, { backgroundColor: brandColors.primary, borderColor: brandColors.primary }]
              : [styles.chipInactive, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }],
          ]}
          onPress={handleSelectYesterday}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              { color: currentFilter.type === 'yesterday' ? '#FFF' : colors.textPrimary },
            ]}
          >
            📅 Yesterday
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            currentFilter.type === 'week'
              ? [styles.chipActive, { backgroundColor: brandColors.primary, borderColor: brandColors.primary }]
              : [styles.chipInactive, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }],
          ]}
          onPress={handleSelectWeek}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              { color: currentFilter.type === 'week' ? '#FFF' : colors.textPrimary },
            ]}
          >
            📆 Last 7 Days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            currentFilter.type === 'custom'
              ? [styles.chipActive, { backgroundColor: brandColors.primary, borderColor: brandColors.primary }]
              : [styles.chipInactive, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }],
          ]}
          onPress={() => setCustomModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              { color: currentFilter.type === 'custom' ? '#FFF' : colors.textPrimary },
            ]}
          >
            🗓️ {currentFilter.type === 'custom' && currentFilter.dateStr ? currentFilter.dateStr : 'Pick Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            currentFilter.type === 'all'
              ? [styles.chipActive, { backgroundColor: brandColors.primary, borderColor: brandColors.primary }]
              : [styles.chipInactive, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }],
          ]}
          onPress={handleSelectAll}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              { color: currentFilter.type === 'all' ? '#FFF' : colors.textPrimary },
            ]}
          >
            📋 All
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Navigation & Summary Strip */}
      <View style={[styles.subBar, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
        {/* Left: Current Active Date with Next/Prev Day Chevrons (if single date) */}
        {currentFilter.dateStr ? (
          <View style={styles.dateNavRow}>
            <TouchableOpacity onPress={() => shiftDay(-1)} style={styles.navBtn}>
              <Text style={{ fontSize: 14, color: brandColors.primary, fontWeight: '700' }}>◀</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCustomModalVisible(true)} style={styles.dateLabelBtn}>
              <Text style={[styles.activeDateText, { color: colors.textPrimary }]}>
                {currentFilter.label} ({currentFilter.dateStr})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => shiftDay(1)}
              style={styles.navBtn}
              disabled={currentFilter.dateStr === todayStr}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: currentFilter.dateStr === todayStr ? colors.textMuted : brandColors.primary,
                  fontWeight: '700',
                }}
              >
                ▶
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.dateNavRow}>
            <Text style={[styles.activeDateText, { color: colors.textPrimary }]}>
              {currentFilter.label}
            </Text>
          </View>
        )}

        {/* Right: Revenue & Count Summary */}
        {summary ? (
          <View style={styles.summaryBadge}>
            <Text style={[styles.summaryCount, { color: colors.textMuted }]}>
              {summary.count} {summary.count === 1 ? 'bill' : 'bills'}
            </Text>
            <Text style={[styles.summaryTotal, { color: brandColors.primary }]}>
              {formatCurrency(summary.totalAmount)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Custom Date Modal */}
      <Modal visible={customModalVisible} transparent animationType="fade" onRequestClose={() => setCustomModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Bill Date</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Enter date in YYYY-MM-DD format to view bills for that specific date.
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary },
              ]}
              value={customDateInput}
              onChangeText={setCustomDateInput}
              placeholder="YYYY-MM-DD (e.g. 2026-11-12)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.quickPresetsRow}>
              <TouchableOpacity
                style={[styles.presetBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setCustomDateInput(todayStr)}
              >
                <Text style={{ fontSize: 12, color: colors.textPrimary }}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetBtn, { backgroundColor: colors.surfaceSubtle }]}
                onPress={() => setCustomDateInput(yesterdayStr)}
              >
                <Text style={{ fontSize: 12, color: colors.textPrimary }}>Yesterday</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: brandColors.primary }]}
                onPress={handleApplyCustomDate}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Apply Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingTop: 8,
    paddingBottom: 6,
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    elevation: 2,
  },
  chipInactive: {},
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  dateLabelBtn: {
    paddingVertical: 2,
  },
  activeDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryBadge: {
    alignItems: 'flex-end',
  },
  summaryCount: {
    fontSize: 10,
    fontWeight: '600',
  },
  summaryTotal: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  quickPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

