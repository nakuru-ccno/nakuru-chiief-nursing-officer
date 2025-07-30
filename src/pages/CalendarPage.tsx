import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("calendar_events").select("*");

    if (error) {
      toast.error("Failed to fetch events");
      console.error("Fetch error:", error.message);
      return;
    }

    const formatted = data.map((event) => {
      const startDate = new Date(event.start_time);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour

      return {
        title: event.title,
        start: startDate,
        end: endDate,
      };
    });

    setEvents(formatted);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStart("");
    setRecurrence("");
  };

  const handleSubmit = async () => {
    if (!title || !start || !session?.user?.email) {
      toast.error("Please fill all required fields.");
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Calendar</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add Calendar Event</DialogTitle>
            <DialogDescription>Enter event details below.</DialogDescription>

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
        endAccessor="end"
        style={{ height: 600 }}
      />
    </div>
  );
}
