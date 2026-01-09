import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScheduleEvent {
  id: string;
  title: string;
  tutor_name: string;
  course_name: string;
  start: string;
  end: string;
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  type: 'class' | 'exam' | 'consultation';
}

interface ScheduleViewProps {
  events: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
  onCreateEvent?: () => void;
  className?: string;
  userRole?: string;
  canCreateEvents?: boolean;
}

export function ScheduleView({ 
  events, 
  onEventClick, 
  onCreateEvent, 
  className = '', 
  //@ts-ignore
  userRole = '',
  canCreateEvents = false 
}: ScheduleViewProps) {
  //@ts-ignore
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get current week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    start.setDate(diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString() &&
        (statusFilter === 'all' || event.status.toLowerCase() === statusFilter) &&
        (searchQuery === '' || 
         event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         event.tutor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         event.course_name.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  };

  // Navigate calendar
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get event status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return '📚';
      case 'exam': return '📝';
      case 'consultation': return '💭';
      default: return '📅';
    }
  };

  const weekDates = getWeekDates(currentDate);
  const selectedDateEvents = view === 'day' ? getEventsForDate(currentDate) : [];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-200 gap-4">
        {/* Navigation and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateCalendar('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateCalendar('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="px-3 h-8 text-sm"
            >
              Today
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {view === 'week' 
              ? `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`
              : formatDate(currentDate)
            }
          </h2>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48 h-8"
            />
          </div>

          {/* Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('week')}
              className={`px-3 h-8 text-sm border-0 rounded-none first:rounded-l-md ${
                view === 'week' ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('day')}
              className={`px-3 h-8 text-sm border-0 rounded-none last:rounded-r-md ${
                view === 'day' ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              Day
            </Button>
          </div>

          {/* Create Button - Only show for tutors or if explicitly allowed */}
          {onCreateEvent && canCreateEvents && (
            <Button onClick={onCreateEvent} className="h-8 px-4">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {view === 'week' ? (
          /* Week View */
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className="min-h-[300px]">
                  {/* Day Header */}
                  <div className="text-center mb-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                    </div>
                    <div className={`text-lg font-medium ${
                      isToday 
                        ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                        : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900 truncate">
                            {getEventTypeIcon(event.type)} {event.title}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </div>
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {event.tutor_name}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {dayEvents.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No events
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Day View */
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {event.tutor_name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {event.course_name}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
                  <p className="text-gray-500 mb-4">You don't have any events scheduled for this day.</p>
                  {onCreateEvent && canCreateEvents && (
                    <Button onClick={onCreateEvent}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 