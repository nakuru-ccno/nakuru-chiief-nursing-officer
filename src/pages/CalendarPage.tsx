import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<string>("");
  const [recurrence, setRecurrence] = useState("");
  const [open, setOpen] = useState(false);

  const session = useSession();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStart("");
    setRecurrence("");
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*");

    if (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch events.");
      return;
    }

    const mapped = data.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      allDay: false,
    }));

    setEvents(mapped);
  };

  const handleSubmit = async () => {
    if (!title || !start || !session?.user?.email) {
      toast.error("Event title, start time, and your login email are required.");
      return;
    }

    const { error } = await supabase.from("calendar_events").insert({
      title,
      description,
      start_time: new Date(start).toISOString(),
      email: session.user.email,
      recurrence: recurrence || null,
    });

    if (error) {
      console.error("Insert Error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      toast.error(`Failed to save event: ${error.message}`);
      return;
    }

    toast.success("Event saved successfully!");
    resetForm();
    setOpen(false);
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">No recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <Button onClick={handleSubmit}>Save Event</Button>
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
}
