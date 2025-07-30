import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    recurrence: "", // daily, weekly, monthly
  });

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load events");
    } else {
      const formatted = data.map((event) => ({
        ...event,
        start: new Date(event.date),
        end: new Date(event.date),
        allDay: true,
      }));
      setEvents(formatted);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    const { title, description, date, recurrence } = newEvent;

    if (!title || !date) {
      toast.warning("Title and date are required");
      return;
    }

    const { error } = await supabase.from("calendar_events").insert([
      {
        title,
        description,
        date,
        recurrence: recurrence || null,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      toast.error("Failed to save event");
    } else {
      toast.success("Event created");
      setNewEvent({ title: "", description: "", date: "", recurrence: "" });
      fetchEvents();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📅 Calendar</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent aria-describedby="event-dialog-desc">
            <p id="event-dialog-desc" className="sr-only">
              Fill out this form to create a new calendar event
            </p>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />
            <Textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
            />
            <Input
              type="date"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
              }
            />
            <select
              value={newEvent.recurrence}
              onChange={(e) =>
                setNewEvent({ ...newEvent, recurrence: e.target.value })
              }
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="">No Recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <Button onClick={handleAddEvent} className="w-full mt-2">
              Save Event
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        popup
      />
    </div>
  );
}
