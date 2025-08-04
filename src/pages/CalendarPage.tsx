import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const session = useSession();

  // Load events from database
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) return;

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('email', userData.user.email);

      if (error) {
        console.error('Error loading events:', error);
        return;
      }

      const formattedEvents = data?.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start || event.date),
        end: new Date(event.end || event.date),
        allDay: false,
        description: event.description,
        ...event
      })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStart("");
    setEnd("");
    setRecurrence("");
    setSelectedEvent(null);
  };

  const handleSubmit = async () => {
    if (!title || !start) {
      toast.error("Event title and start time are required.");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) {
        toast.error("User email not found");
        return;
      }

      const endTime = end || start;
      
      // Save to database immediately
      const { data: dbEvent, error: dbError } = await supabase
        .from('calendar_events')
        .insert({
          title,
          description,
          start: start,
          end: endTime,
          email: userData.user.email,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error("Failed to save event to database.");
        return;
      }

      // Show success immediately
      toast.success("Event added successfully!");
      
      // Send email notification via Edge Function (don't wait for it)
      supabase.functions.invoke('send-calendar-email', {
        body: {
          email: userData.user.email,
          event: { 
            title, 
            description, 
            date: start.split('T')[0],
            start_time: start.split('T')[1],
            end_time: endTime.split('T')[1]
          },
        },
      }).then(response => {
        if (response.error) {
          console.error('Error sending email:', response.error);
        } else {
          console.log('Email notification sent successfully');
        }
      }).catch(error => {
        console.error('Error sending email:', error);
      });

      // Reload events from database
      await loadEvents();
      
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error("Failed to add event. Please try again.");
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setDescription(event.description || "");
    setStart(moment(event.start).format('YYYY-MM-DDTHH:mm'));
    setEnd(moment(event.end).format('YYYY-MM-DDTHH:mm'));
    setEditOpen(true);
  };

  const handleEventUpdate = async () => {
    if (!selectedEvent || !title || !start) {
      toast.error("Event title and start time are required.");
      return;
    }

    try {
      const endTime = end || start;
      
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title,
          description,
          start: start,
          end: endTime,
        })
        .eq('id', selectedEvent.id);

      if (error) {
        console.error('Update error:', error);
        toast.error("Failed to update event.");
        return;
      }

      await loadEvents();
      resetForm();
      setEditOpen(false);
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("Failed to update event.");
    }
  };

  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) {
        console.error('Delete error:', error);
        toast.error("Failed to delete event.");
        return;
      }

      await loadEvents();
      resetForm();
      setEditOpen(false);
      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error("Failed to delete event.");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📅 Calendar</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle className="text-xl font-semibold text-gray-900">Add Calendar Event</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new event for your calendar. Fill in the details below.
            </DialogDescription>

            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Event Title *</label>
                <Input
                  placeholder="Enter event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  placeholder="Add event description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Time *</label>
                  <Input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Time</label>
                  <Input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">Leave empty to use start time</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  disabled={!title || !start}
                >
                  Add Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleEventSelect}
        popup
      />

      {/* Edit Event Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogTitle>Edit Calendar Event</DialogTitle>
          <DialogDescription>
            Update event details below.
          </DialogDescription>

          <Input
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <Input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEventUpdate}>Update Event</Button>
            <Button variant="destructive" onClick={handleEventDelete}>Delete Event</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>✅ Event Added Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your calendar event has been created and you will receive a reminder email 1 hour before the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setSuccessDialogOpen(false);
              window.location.href = '/calendar';
            }}>
              Continue to Agenda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarPage;