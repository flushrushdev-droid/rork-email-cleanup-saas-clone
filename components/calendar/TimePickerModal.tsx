import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { createCalendarStyles } from './styles/calendarStyles';

interface TimePickerModalProps {
  visible: boolean;
  selectedTime: Date;
  onConfirm: (time: Date) => void;
  onCancel: () => void;
  title: string;
  insets: EdgeInsets;
  colors: any;
}

export function TimePickerModal({
  visible,
  selectedTime,
  onConfirm,
  onCancel,
  title,
  insets,
  colors,
}: TimePickerModalProps) {
  const styles = createCalendarStyles(colors);
  const [tempHour, setTempHour] = React.useState<string>('12');
  const [tempMinute, setTempMinute] = React.useState<string>('00');
  const [tempAMPM, setTempAMPM] = React.useState<'AM' | 'PM'>('PM');

  useEffect(() => {
    if (visible) {
      let hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();
      const ampm: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
      
      if (hour > 12) {
        hour -= 12;
      } else if (hour === 0) {
        hour = 12;
      }
      
      setTempHour(hour.toString().padStart(2, '0'));
      setTempMinute(minute.toString().padStart(2, '0'));
      setTempAMPM(ampm);
    }
  }, [visible, selectedTime]);

  const handleConfirm = () => {
    let hour = parseInt(tempHour, 10);
    const minute = parseInt(tempMinute, 10);
    
    if (!isNaN(hour) && !isNaN(minute)) {
      if (tempAMPM === 'PM' && hour !== 12) {
        hour += 12;
      } else if (tempAMPM === 'AM' && hour === 12) {
        hour = 0;
      }
      const newDate = new Date(selectedTime);
      newDate.setHours(hour, minute, 0, 0);
      onConfirm(newDate);
    } else {
      onCancel();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.iosPickerOverlay}>
        <Pressable
          testID={`ios-time-picker-backdrop-${title.toLowerCase().includes('start') ? 'start' : 'end'}`}
          style={styles.iosPickerBackdrop}
          onPress={onCancel}
        />
        <View style={[styles.datePickerContainerIOS, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.datePickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeInputsRow}>
            <View style={styles.timeInputGroup}>
              <Text style={styles.dateInputLabel}>Hour</Text>
              <TextInput
                style={styles.dateInput}
                value={tempHour}
                onChangeText={setTempHour}
                keyboardType="number-pad"
                placeholder="12"
                maxLength={2}
              />
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeInputGroup}>
              <Text style={styles.dateInputLabel}>Minute</Text>
              <TextInput
                style={styles.dateInput}
                value={tempMinute}
                onChangeText={setTempMinute}
                keyboardType="number-pad"
                placeholder="00"
                maxLength={2}
              />
            </View>
            <View style={styles.ampmContainer}>
              <TouchableOpacity
                style={[styles.ampmButton, tempAMPM === 'AM' && styles.ampmButtonActive]}
                onPress={() => setTempAMPM('AM')}
              >
                <Text style={[styles.ampmText, tempAMPM === 'AM' && styles.ampmTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ampmButton, tempAMPM === 'PM' && styles.ampmButtonActive]}
                onPress={() => setTempAMPM('PM')}
              >
                <Text style={[styles.ampmText, tempAMPM === 'PM' && styles.ampmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}


