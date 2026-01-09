import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Plus,
  Search,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  type CalendarEvent, 
  type CalendarView, 
  type Course,
  DAYS_OF_WEEK 
} from './CourseModels';

interface CourseCalendarProps {
  courses: Course[];
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onCreateEvent?: () => void;
  className?: string;
}

export function CourseCalendar({
  courses,
  events,
  onEventClick,
  onTimeSlotClick,
  onCreateEvent,
  className
}: CourseCalendarProps) {
  const [view, setView] = useState<CalendarView>({
    type: 'week',
    date: new Date()
  });
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dayScrollContainerRef = useRef<HTMLDivElement>(null);
  const dayTimeColumnRef = useRef<HTMLDivElement>(null);

  // Time slots for full 24 hours (Google Calendar style)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Scroll to current time on mount and sync scrolling for day view
  useEffect(() => {
    if (scrollContainerRef.current && (view.type === 'day' || view.type === 'week')) {
      const currentHour = new Date().getHours();
      const targetHour = Math.max(6, currentHour - 2); // Start at 6 AM or 2 hours before current time
      const hourHeight = 60; // Increased height for better visibility
      const scrollTop = targetHour * hourHeight;
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
        
        // Sync day view scrolling if in day view
        if (view.type === 'day' && dayScrollContainerRef.current) {
          dayScrollContainerRef.current.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [view.type]);

  // Sync scrolling between time column and day content in day view
  const handleDayScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (dayTimeColumnRef.current) {
      dayTimeColumnRef.current.scrollTop = scrollTop;
    }
  };

  const handleTimeColumnScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (dayScrollContainerRef.current) {
      dayScrollContainerRef.current.scrollTop = scrollTop;
    }
  };

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(view.date);
    
    if (view.type === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (view.type === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view.type === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setView({ ...view, date: newDate });
  };

  const goToToday = () => {
    setView({ ...view, date: new Date() });
  };

  // Get week dates for week view
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  // Get month dates for month view
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - (startDay === 0 ? 6 : startDay - 1));

    const endDay = endDate.getDay();
    endDate.setDate(endDate.getDate() + (endDay === 0 ? 0 : 7 - endDay));

    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesFilter = selectedCourseFilter === 'all' || event.course_id === selectedCourseFilter;
      const matchesSearch = !searchQuery || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tutor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.course_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [events, selectedCourseFilter, searchQuery]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Format time for display
  const formatTime = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour.toString().padStart(2, '0')}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${(hour - 12).toString().padStart(2, '0')}:00 PM`;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format month/year for header
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Get week range for display
  const getWeekRange = (date: Date) => {
    const weekDates = getWeekDates(date);
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()} – ${endDate.getDate()}, ${startDate.getFullYear()}`;
    } else {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`;
    }
  };

  // Google Calendar-style event component
  const EventBlock = ({ event, style = {} }: { event: CalendarEvent; style?: React.CSSProperties }) => {
    const getEventColor = (status: string) => {
      switch (status) {
        case 'Active': return 'bg-blue-600 border-l-blue-700 text-white';
        case 'Scheduled': return 'bg-green-600 border-l-green-700 text-white';
        case 'Completed': return 'bg-gray-600 border-l-gray-700 text-white';
        case 'Cancelled': return 'bg-red-600 border-l-red-700 text-white';
        default: return 'bg-indigo-600 border-l-indigo-700 text-white';
      }
    };

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const duration = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60));

    return (
      <div
        className={`absolute left-1 right-1 rounded-sm border-l-4 px-2 py-1 cursor-pointer hover:shadow-md transition-shadow text-xs overflow-hidden ${getEventColor(event.status)}`}
        style={style}
        onClick={() => onEventClick?.(event)}
        title={`${event.title} - ${event.tutor_name} (${duration} min)`}
      >
        <div className="font-medium truncate text-white">{event.title}</div>
        <div className="text-xs opacity-90 truncate">
          {eventStart.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })}
        </div>
      </div>
    );
  };

  // Calculate event positioning
  const getEventStyle = (event: CalendarEvent, date: Date) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    if (eventStart.toDateString() !== date.toDateString()) return null;
    
    const startHour = eventStart.getHours();
    const startMinutes = eventStart.getMinutes();
    const endHour = eventEnd.getHours();
    const endMinutes = eventEnd.getMinutes();
    
    const startPosition = (startHour * 60 + startMinutes) / 60 * 60; // 60px per hour
    const duration = ((endHour * 60 + endMinutes) - (startHour * 60 + startMinutes)) / 60 * 60;
    
    return {
      top: `${startPosition}px`,
      height: `${Math.max(duration, 30)}px`,
      zIndex: 10
    };
  };

  // Current time indicator
  const getCurrentTimePosition = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (minutes / 60) * 60; // 60px per hour
  };

  return (
    <div className={`h-full flex flex-col bg-white ${className}`}>
      {/* Google Calendar Style Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        {/* Left side - Navigation */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateCalendar('prev')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateCalendar('next')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="px-3 h-8 text-sm hover:bg-gray-100"
            >
              Today
            </Button>
          </div>
          
          <h1 className="text-2xl font-normal text-gray-900">
            {view.type === 'month' 
              ? formatMonthYear(view.date)
              : view.type === 'week'
              ? getWeekRange(view.date)
              : formatDate(view.date)
            }
          </h1>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 h-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
            <SelectTrigger className="w-40 h-8 border-gray-300">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Selector */}
          <div className="flex items-center border border-gray-300 rounded-md">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <Button
                key={viewType}
                variant="ghost"
                size="sm"
                onClick={() => setView({ ...view, type: viewType })}
                className={`px-3 h-8 text-sm border-0 rounded-none first:rounded-l-md last:rounded-r-md ${
                  view.type === viewType 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </Button>
            ))}
          </div>

          {/* Create Button */}
          <Button 
            onClick={onCreateEvent} 
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {/* Week View */}
        {view.type === 'week' && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Week Header */}
            <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
              {/* Empty corner for time column */}
              <div className="w-20 border-r border-gray-200 flex-shrink-0"></div>
              
              {/* Day headers */}
              <div className="flex-1 grid grid-cols-7 min-w-0">
                {getWeekDates(view.date).map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dayInfo = DAYS_OF_WEEK[date.getDay()];
                  return (
                    <div key={index} className="py-2 px-4 border-r border-gray-200 last:border-r-0 text-center">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        {dayInfo?.short?.toUpperCase() || ''}
                      </div>
                      <div className={`text-2xl ${
                        isToday 
                          ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto font-medium' 
                          : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time grid container */}
            <div className="flex-1 relative overflow-hidden">
              {/* All-day events section (if needed) */}
              <div className="flex border-b border-gray-200 bg-gray-50 min-h-[1px] flex-shrink-0">
                <div className="w-20 border-r border-gray-200 flex-shrink-0"></div>
                <div className="flex-1">
                  {/* All-day events would go here */}
                </div>
              </div>

              {/* Scrollable time grid */}
              <div 
                ref={scrollContainerRef}
                className="overflow-auto h-full relative"
                style={{ 
                  scrollBehavior: 'smooth',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}
              >
                <div className="relative" style={{ minHeight: `${24 * 60}px`, width: '100%' }}>
                  {timeSlots.map((hour) => (
                    <div key={hour} className="flex" style={{ height: '60px', minWidth: '100%' }}>
                      {/* Time label */}
                      <div className="w-20 relative border-r border-gray-200 bg-white sticky left-0 z-10 flex-shrink-0">
                        <div className="absolute -top-2 right-3 text-xs text-gray-600 bg-white px-1 font-medium">
                          {formatTime(hour)}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
                      </div>
                      
                      {/* Day columns */}
                      <div className="flex-1 grid grid-cols-7 min-w-0">
                        {getWeekDates(view.date).map((date, dayIndex) => {
                          const isToday = date.toDateString() === new Date().toDateString();
                          const currentHour = new Date().getHours();
                          const isCurrentHour = isToday && hour === currentHour;
                          
                          return (
                            <div
                              key={`${hour}-${dayIndex}`}
                              className={`border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-blue-50 transition-colors relative ${
                                isCurrentHour ? 'bg-blue-25' : ''
                              }`}
                              onClick={() => onTimeSlotClick?.(date, hour)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Events overlay */}
                <div className="absolute inset-0 pointer-events-none z-20" style={{ width: '100%' }}>
                  <div className="flex h-full" style={{ minWidth: '100%' }}>
                    {/* Skip time column space */}
                    <div className="w-20 flex-shrink-0"></div>
                    
                    {/* Day columns for events */}
                    <div className="flex-1 grid grid-cols-7 min-w-0">
                      {getWeekDates(view.date).map((date, dayIndex) => (
                        <div key={`events-${dayIndex}`} className="relative">
                          {getEventsForDate(date).map((event) => {
                            const style = getEventStyle(event, date);
                            if (!style) return null;
                            
                            return (
                              <div key={event.id} className="pointer-events-auto">
                                <EventBlock
                                  event={event}
                                  style={style}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current time indicator */}
                {getWeekDates(view.date).some(date => date.toDateString() === new Date().toDateString()) && (
                  <div 
                    className="absolute left-20 right-0 h-0.5 bg-red-500 z-30 pointer-events-none"
                    style={{ top: `${getCurrentTimePosition()}px` }}
                  >
                    <div className="absolute left-0 w-2 h-2 bg-red-500 rounded-full -translate-y-1/2 -translate-x-1"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Day View */}
        {view.type === 'day' && (
          <div className="h-full flex flex-col">
            {/* Day Header */}
            <div className="flex border-b border-gray-200 bg-white">
              {/* Time column placeholder */}
              <div className="w-20 border-r border-gray-200 bg-gray-50">
                <div className="h-16 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Day header */}
              <div className="flex-1 bg-white">
                <div className="h-16 flex items-center justify-center border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {DAYS_OF_WEEK[view.date.getDay()]?.full?.toUpperCase() || ''}
                    </div>
                    <div className={`text-2xl font-light ${
                      view.date.toDateString() === new Date().toDateString()
                        ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto font-medium'
                        : 'text-gray-900'
                    }`}>
                      {view.date.getDate()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* All-day events section */}
            <div className="flex border-b border-gray-200 bg-gray-50 min-h-[32px]">
              <div className="w-20 border-r border-gray-200 bg-gray-50"></div>
              <div className="flex-1 p-2">
                {/* All-day events would go here */}
                <div className="text-xs text-gray-500">All-day events</div>
              </div>
            </div>

            {/* Time grid */}
            <div className="flex-1 flex overflow-hidden">
              {/* Time column */}
              <div className="w-20 border-r border-gray-200 bg-gray-50 flex-shrink-0">
                <div 
                  className="overflow-auto h-full scrollbar-hide"
                  ref={dayTimeColumnRef}
                  onScroll={handleTimeColumnScroll}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div style={{ minHeight: `${24 * 60}px` }}>
                    {timeSlots.map((hour) => (
                      <div key={hour} className="relative" style={{ height: '60px' }}>
                        <div className="absolute -top-2 right-3 text-xs text-gray-600 bg-gray-50 px-1 font-medium">
                          {formatTime(hour)}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Day content area */}
              <div className="flex-1 relative overflow-hidden">
                <div 
                  className="h-full overflow-auto relative"
                  ref={dayScrollContainerRef}
                  onScroll={handleDayScroll}
                >
                  {/* Time grid background */}
                  <div style={{ minHeight: `${24 * 60}px` }}>
                    {timeSlots.map((hour) => {
                      const isCurrentHour = view.date.toDateString() === new Date().toDateString() && 
                                          hour === new Date().getHours();
                      
                      return (
                        <div
                          key={hour}
                          className={`border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                            isCurrentHour ? 'bg-blue-25' : ''
                          }`}
                          style={{ height: '60px' }}
                          onClick={() => onTimeSlotClick?.(view.date, hour)}
                        />
                      );
                    })}
                  </div>

                  {/* Events overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {getEventsForDate(view.date).map((event) => {
                      const style = getEventStyle(event, view.date);
                      if (!style) return null;
                      
                      return (
                        <div key={event.id} className="pointer-events-auto">
                          <EventBlock
                            event={event}
                            style={{ 
                              ...style, 
                              left: '8px',
                              right: '8px',
                              width: 'auto'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Current time indicator */}
                  {view.date.toDateString() === new Date().toDateString() && (
                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-red-500 z-30 pointer-events-none"
                      style={{ top: `${getCurrentTimePosition()}px` }}
                    >
                      <div className="absolute left-0 w-2 h-2 bg-red-500 rounded-full -translate-y-1/2"></div>
                      <div className="absolute left-3 -top-3 text-xs bg-red-500 text-white px-1 rounded">
                        {new Date().toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Month View */}
        {view.type === 'month' && (
          <div className="h-full bg-white">
            {/* Month header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="py-3 text-center text-xs font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
                  {day?.short?.toUpperCase() || ''}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-7 h-full">
              {getMonthDates(view.date).map((date, index) => {
                const eventsForDate = getEventsForDate(date);
                const isCurrentMonth = date.getMonth() === view.date.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                    }`}
                    onClick={() => onTimeSlotClick?.(date, 9)}
                  >
                    <div className={`text-sm mb-1 ${
                      isToday 
                        ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-medium'
                        : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {eventsForDate.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {eventsForDate.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{eventsForDate.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCalendar; 