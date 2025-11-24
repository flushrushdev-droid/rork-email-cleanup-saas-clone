import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CalendarEvent } from '@/hooks/useCalendar';

type CalendarContextType = {
	events: CalendarEvent[];
	setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
	addEvent: (event: CalendarEvent) => void;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
	const [events, setEvents] = useState<CalendarEvent[]>([]);

	const value = useMemo<CalendarContextType>(
		() => ({
			events,
			setEvents,
			addEvent: (event: CalendarEvent) => {
				setEvents((prev) => [...prev, event]);
			},
		}),
		[events],
	);

	return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendarStore(): CalendarContextType {
	const ctx = useContext(CalendarContext);
	if (!ctx) {
		throw new Error('useCalendarStore must be used within CalendarProvider');
	}
	return ctx;
}


