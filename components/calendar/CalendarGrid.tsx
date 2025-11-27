import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { generateCalendarWeeks, isToday, isSelected, monthNames, dayNames } from './utils/calendarUtils';
import { createCalendarStyles } from './styles/calendarStyles';
import type { CalendarEvent } from '@/hooks/useCalendar';

interface CalendarGridProps {
  selectedDate: Date;
  onDayPress: (day: number | null) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  colors: any;
  events?: CalendarEvent[];
  showEventIndicators?: boolean;
  showSelectedDateInfo?: boolean;
}

export function CalendarGrid({
  selectedDate,
  onDayPress,
  goToPreviousMonth,
  goToNextMonth,
  colors,
  events = [],
  showEventIndicators = false,
  showSelectedDateInfo = true,
}: CalendarGridProps) {
  const styles = createCalendarStyles(colors);
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const weeks = generateCalendarWeeks(currentYear, currentMonth);

  const handleDayPress = (day: number | null) => {
    if (day) {
      onDayPress(day);
    }
  };

  const hasEventForDay = (day: number | null): boolean => {
    if (!day || !showEventIndicators || events.length === 0) return false;
    return events.some(
      (e) =>
        e.date.getFullYear() === currentYear &&
        e.date.getMonth() === currentMonth &&
        e.date.getDate() === day
    );
  };

  return (
    <>
      <View style={styles.monthNavigation}>
        <TouchableOpacity 
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          accessibilityHint="Double tap to navigate to the previous month"
          onPress={goToPreviousMonth} 
          style={styles.monthButton}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <AppText 
          style={styles.monthText}
          accessibilityRole="header"
          accessibilityLabel={`${monthNames[currentMonth]} ${currentYear}`}
          dynamicTypeStyle="title2"
        >
          {monthNames[currentMonth]} {currentYear}
        </AppText>
        <TouchableOpacity 
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          accessibilityHint="Double tap to navigate to the next month"
          onPress={goToNextMonth} 
          style={styles.monthButton}
        >
          <ChevronRight size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarGrid}>
        <View style={styles.weekDaysRow}>
          {dayNames.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <AppText style={styles.weekDayText} dynamicTypeStyle="caption">{day}</AppText>
            </View>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              const dayIsToday = isToday(day, currentMonth, currentYear);
              const dayIsSelected = isSelected(day, selectedDate, currentMonth, currentYear);
              const hasEvent = hasEventForDay(day);

              return (
                <TouchableOpacity
                  key={dayIndex}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={day ? `${day}${dayIsToday ? ', today' : ''}${dayIsSelected ? ', selected' : ''}${hasEvent ? ', has events' : ''}` : 'Empty day'}
                  accessibilityHint={day ? 'Double tap to select this date' : undefined}
                  accessibilityState={{ selected: dayIsSelected }}
                  style={[
                    styles.dayCell,
                    dayIsToday && styles.todayCell,
                    dayIsSelected && styles.selectedDayCell,
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={!day}
                >
                  <AppText
                    style={[
                      styles.dayText,
                      !day && styles.emptyDayText,
                      dayIsToday && styles.todayText,
                      dayIsSelected && styles.selectedDayText,
                    ]}
                    dynamicTypeStyle="body"
                  >
                    {day || ''}
                  </AppText>
                  {hasEvent && day && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 6,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: dayIsSelected ? colors.surface : colors.primary,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {showSelectedDateInfo && (
        <View style={styles.selectedDateInfo}>
          <AppText style={styles.selectedDateLabel} dynamicTypeStyle="caption">Selected Date</AppText>
          <AppText style={styles.selectedDateValue} dynamicTypeStyle="body">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </AppText>
        </View>
      )}
    </>
  );
}

