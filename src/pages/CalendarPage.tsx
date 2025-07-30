import { useEffect, useState } from "react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
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
  const [refreshFlag, setRefreshFlag] = useState(false);

  const session = useSession();

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("email", session?.user?.email);

    if (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load events");
    } else {
      const parsedEvents = data.map((event: any) => ({
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        title: event.title,
      }));
      setEvents(parsedEvents);
    }
  };

  useEffect(() => {
    if (session?.user?.email) fetchEvents();
  }, [session, refreshFlag]);

  const handleEventAdded = () => {
    setRefreshFlag(!refreshFlag);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📅 Calendar</h2>
        <AddEventDialog onEventAdded={handleEventAdded} />
      </div>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
      />
    </div>
  );
}

function AddEventDialog({ onEventAdded }: { onEventAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<string>("");
  const [recurrence, setRecurrence] = useState("");
  const [open, setOpen] = useState(false);

  const session = useSession();

  useEffect(() => {
    const now = new Date();
    const toDatetimeLocal = (dt: Date) => dt.toISOString().slice(0, 16);
    setStart(toDatetimeLocal(now));
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRecurrence("");
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!title || !start || !session?.user?.email) {
      toast.error("Please fill in all fields.");
      return;
    }

    const startTime = new Date(start);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

    const { error } = await supabase.from("calendar_events").insert({
      title,
      description,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      email: session.user.email,
      recurrence: recurrence || null,
    });

    if (error) {
      console.error("Insert Error:", error);
      toast.error(`Failed to save event: ${error.message}`);
      return;
    }

    toast.success("Event saved!");
    resetForm();
    onEventAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogDescription>Enter event details below.</DialogDescription>

        <label className="text-sm mt-2">Event Title</label>
        <Input
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="text-sm mt-2">Description</label>
        <Textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="text-sm mt-2">Start Time</label>
        <Input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <label className="text-sm mt-2">Recurrence</label>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">No recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit}>Save Event</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
