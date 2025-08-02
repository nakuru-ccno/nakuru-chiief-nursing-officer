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
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [recurrence, setRecurrence] = useState("");

  const session = useSession();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStart("");
    setRecurrence("");
  };

  const handleSubmit = async () => {
    if (!title || !start || !session?.user?.email) {
      toast.error("Event title, start time, and your login email are required.");
      return;
    }

    try {
      // Add to local state first for immediate UI feedback
      const newEvent = {
        id: Date.now().toString(),
        title,
        start: new Date(start),
        allDay: false,
      };

      setEvents(prev => [...prev, newEvent]);

      // Send email via Edge Function
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email) {
        const response = await supabase.functions.invoke('send-calendar-email', {
          body: {
            email: userData.user.email,
            event: { 
              title, 
              description, 
              date: start.split('T')[0], // Extract date part
              start_time: start.split('T')[1], // Extract time part
              end_time: start.split('T')[1] // Use same time for end (can be modified)
            },
          },
        });

        if (response.error) {
          console.error('Error sending email:', response.error);
          toast.error("Event added but email notification failed.");
        } else {
          console.log('Email sent successfully:', response.data);
        }
      }

      resetForm();
      setOpen(false);
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error("Failed to add event. Please try again.");
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
          <DialogContent>
            <DialogTitle>Add Calendar Event</DialogTitle>
            <DialogDescription>
              Enter event details below.
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

            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />

            <Button onClick={handleSubmit}>Add Event</Button>
          </DialogContent>
        </Dialog>
      </div>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="start"
        style={{ height: 600 }}
      />

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