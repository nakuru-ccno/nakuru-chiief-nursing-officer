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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "@/hooks/useSession";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
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

    // For now, just add to local state since calendar_events table is not in types
    const newEvent = {
      id: Date.now().toString(),
      title,
      start: new Date(start),
      allDay: false,
    };

    setEvents(prev => [...prev, newEvent]);
    toast.success("Event added successfully!");
    resetForm();
    setOpen(false);
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
    </div>
  );
};

export default CalendarPage;