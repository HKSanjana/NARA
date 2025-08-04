import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Users, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCalendarEventSchema } from "@shared/schema";
import { z } from "zod";

const eventFormSchema = insertCalendarEventSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/calendar/events', currentDate.getFullYear(), currentDate.getMonth()],
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['/api/divisions'],
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return apiRequest('POST', '/api/calendar/events', {
        ...data,
        date: new Date(data.date).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      setIsEventModalOpen(false);
      reset();
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventFormData> }) => {
      return apiRequest('PUT', `/api/calendar/events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      setIsEventModalOpen(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      reset();
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/calendar/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (day: number) => {
    if (!day) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return events.filter((event: any) => event.date.split('T')[0] === dateStr);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'research':
        return 'bg-blue-500';
      case 'monitoring':
        return 'bg-green-500';
      case 'training':
        return 'bg-yellow-500';
      case 'meeting':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const onSubmit = (data: EventFormData) => {
    if (isEditMode && selectedEvent) {
      updateEventMutation.mutate({ id: selectedEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setValue("title", event.title);
    setValue("description", event.description || "");
    setValue("date", event.date.split('T')[0]);
    setValue("startTime", event.startTime);
    setValue("endTime", event.endTime || "");
    setValue("eventType", event.eventType);
    setValue("divisionId", event.divisionId || "");
    setValue("location", event.location || "");
    setIsEventModalOpen(true);
  };

  const handleNewEvent = () => {
    setIsEditMode(false);
    setSelectedEvent(null);
    reset();
    setIsEventModalOpen(true);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">Research Activities Calendar</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track and manage research activities, monitoring sessions, training programs, and meetings across all NARA divisions.
          </p>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            {/* Calendar Header */}
            <CardHeader className="bg-nara-navy text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigateMonth('prev')}
                      variant="secondary"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => navigateMonth('next')}
                      variant="secondary"
                      size="sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleNewEvent} variant="secondary" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {isEditMode ? 'Edit Event' : 'Create New Event'}
                        </DialogTitle>
                        <DialogDescription>
                          {isEditMode ? 'Update the event details' : 'Add a new event to the calendar'}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Event Title *</Label>
                          <Input
                            id="title"
                            {...register("title")}
                            className={errors.title ? "border-red-500" : ""}
                          />
                          {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            {...register("description")}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="date">Date *</Label>
                            <Input
                              id="date"
                              type="date"
                              {...register("date")}
                              className={errors.date ? "border-red-500" : ""}
                            />
                            {errors.date && (
                              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="eventType">Type</Label>
                            <Select onValueChange={(value) => setValue("eventType", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="research">Research</SelectItem>
                                <SelectItem value="monitoring">Monitoring</SelectItem>
                                <SelectItem value="training">Training</SelectItem>
                                <SelectItem value="meeting">Meeting</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="startTime">Start Time *</Label>
                            <Input
                              id="startTime"
                              type="time"
                              {...register("startTime")}
                              className={errors.startTime ? "border-red-500" : ""}
                            />
                            {errors.startTime && (
                              <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                              id="endTime"
                              type="time"
                              {...register("endTime")}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="divisionId">Division</Label>
                          <Select onValueChange={(value) => setValue("divisionId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select division" />
                            </SelectTrigger>
                            <SelectContent>
                              {divisions.map((division: any) => (
                                <SelectItem key={division.id} value={division.id}>
                                  {division.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            {...register("location")}
                            placeholder="Enter location"
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button
                            type="submit"
                            disabled={isSubmitting || createEventMutation.isPending || updateEventMutation.isPending}
                            className="flex-1 bg-nara-navy hover:bg-blue-800"
                          >
                            {isSubmitting || createEventMutation.isPending || updateEventMutation.isPending
                              ? 'Saving...'
                              : isEditMode ? 'Update Event' : 'Create Event'
                            }
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEventModalOpen(false);
                              setIsEditMode(false);
                              setSelectedEvent(null);
                              reset();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Calendar Grid Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday = day === new Date().getDate() && 
                                  currentDate.getMonth() === new Date().getMonth() && 
                                  currentDate.getFullYear() === new Date().getFullYear();
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border border-gray-200 rounded-lg ${
                        day ? 'hover:bg-gray-50 cursor-pointer' : ''
                      } ${isToday ? 'bg-nara-light border-nara-navy' : ''}`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-nara-navy font-bold' : 'text-gray-800'}`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event: any, eventIndex: number) => (
                              <div
                                key={eventIndex}
                                onClick={() => setSelectedEvent(event)}
                                className={`text-xs p-1 rounded truncate text-white cursor-pointer ${getEventTypeColor(event.eventType)}`}
                                title={`${event.title} - ${formatTime(event.startTime)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                {selectedEvent.title}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditEvent(selectedEvent)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteEventMutation.mutate(selectedEvent.id)}
                    disabled={deleteEventMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <h4 className="font-semibold text-gray-800">Description</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{new Date(selectedEvent.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {formatTime(selectedEvent.startTime)}
                    {selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
                  </span>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedEvent.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getEventTypeColor(selectedEvent.eventType)}`}></div>
                <span className="text-sm capitalize">{selectedEvent.eventType}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
