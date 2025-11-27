import React, { useRef, useEffect } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { createCalendarStyles } from './styles/calendarStyles';
import type { ThemeColors } from '@/constants/colors';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  colors: ThemeColors;
}

export function DatePickerModal({
  visible,
  selectedDate,
  onConfirm,
  onCancel,
  colors,
}: DatePickerModalProps) {
  const styles = createCalendarStyles(colors);
  const [tempYear, setTempYear] = React.useState<string>(selectedDate.getFullYear().toString());
  const [tempMonth, setTempMonth] = React.useState<string>((selectedDate.getMonth() + 1).toString());
  const [tempDay, setTempDay] = React.useState<string>(selectedDate.getDate().toString());

  const monthRef = useRef<ScrollView>(null);
  const dayRef = useRef<ScrollView>(null);
  const yearRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTempYear(selectedDate.getFullYear().toString());
      setTempMonth((selectedDate.getMonth() + 1).toString());
      setTempDay(selectedDate.getDate().toString());
      
      // Scroll to selected values
      setTimeout(() => {
        monthRef.current?.scrollTo({ y: (selectedDate.getMonth()) * 44, animated: false });
        dayRef.current?.scrollTo({ y: (selectedDate.getDate() - 1) * 44, animated: false });
        yearRef.current?.scrollTo({ y: (selectedDate.getFullYear() - 2000) * 44, animated: false });
      }, 100);
    }
  }, [visible, selectedDate]);

  const handleConfirm = () => {
    const year = parseInt(tempYear, 10);
    const month = parseInt(tempMonth, 10) - 1;
    const day = parseInt(tempDay, 10);
    
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const newDate = new Date(year, month, day);
      onConfirm(newDate);
    } else {
      onCancel();
    }
  };

  if (!visible) return null;

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 50 }, (_, i) => 2000 + i);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.pickerCenterOverlay}>
        <Pressable
          testID="ios-date-picker-backdrop"
          style={styles.pickerBackdrop}
          onPress={onCancel}
        />
        <View style={styles.pickerCenterContainer}>
          <View style={styles.datePickerHeader}>
            <AppText style={styles.datePickerTitle} dynamicTypeStyle="title2">Select Date</AppText>
            <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <AppText style={styles.datePickerDone} dynamicTypeStyle="headline">Done</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.wheelPickersContainer}>
            <View style={styles.wheelPickerColumn}>
              <AppText style={styles.wheelPickerLabel} dynamicTypeStyle="caption">Month</AppText>
              <View style={styles.wheelPickerWrapper}>
                <View style={styles.wheelPickerHighlight} />
                <ScrollView
                  ref={monthRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={44}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.y / 44);
                    setTempMonth((index + 1).toString());
                  }}
                  contentContainerStyle={styles.wheelScrollContent}
                >
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempMonth(month.toString());
                        monthRef.current?.scrollTo({ y: (month - 1) * 44, animated: true });
                      }}
                    >
                      <AppText style={[styles.wheelItemText, tempMonth === month.toString() && styles.wheelItemTextActive]} dynamicTypeStyle="body">
                        {month}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.wheelPickerColumn}>
              <AppText style={styles.wheelPickerLabel} dynamicTypeStyle="caption">Day</AppText>
              <View style={styles.wheelPickerWrapper}>
                <View style={styles.wheelPickerHighlight} />
                <ScrollView
                  ref={dayRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={44}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.y / 44);
                    setTempDay((index + 1).toString());
                  }}
                  contentContainerStyle={styles.wheelScrollContent}
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempDay(day.toString());
                        dayRef.current?.scrollTo({ y: (day - 1) * 44, animated: true });
                      }}
                    >
                      <AppText style={[styles.wheelItemText, tempDay === day.toString() && styles.wheelItemTextActive]} dynamicTypeStyle="body">
                        {day}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={[styles.wheelPickerColumn, { flex: 1.3 }]}>
              <AppText style={styles.wheelPickerLabel} dynamicTypeStyle="caption">Year</AppText>
              <View style={styles.wheelPickerWrapper}>
                <View style={styles.wheelPickerHighlight} />
                <ScrollView
                  ref={yearRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={44}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.y / 44);
                    setTempYear((2000 + index).toString());
                  }}
                  contentContainerStyle={styles.wheelScrollContent}
                >
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempYear(year.toString());
                        yearRef.current?.scrollTo({ y: (year - 2000) * 44, animated: true });
                      }}
                    >
                      <AppText style={[styles.wheelItemText, tempYear === year.toString() && styles.wheelItemTextActive]} dynamicTypeStyle="body">
                        {year}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}


