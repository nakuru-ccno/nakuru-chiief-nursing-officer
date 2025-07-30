import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    email: "",
    recurrence: "",
  });

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("calendar_events").select("*");
    if (error) {
      toast.error("Failed to load events");
    } else {
      const formatted = data.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        title: event.title,
      }));
      setEvents(formatted);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.start || !form.email) {
      toast.error("Please provide title, start time, and email");
      return;
    }

    const { error } = await supabase.from("calendar_events").insert([
      {
        title: form.title,
        description: form.description || "",
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
        email: form.email,
        recurrence: form.recurrence || "",
        date: new Date(form.start).toISOString(),
        reminder_sent: false,
      },
    ]);

    if (error) {
      console.error("Insert Error:", error);
      toast.error("Failed to save event: " + error.message);
    } else {
      toast.success("Event saved");
      setOpen(false);
      fetchEvents();
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent className="space-y-4">
            <h2 className="text-xl font-semibold">Add New Event</h2>
            <Input
              placeholder="Event Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              type="datetime-local"
              placeholder="Start Time"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
            <Input
              type="datetime-local"
              placeholder="End Time"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Recurrence (e.g., daily, weekly)"
              value={form.recurrence}
              onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save Event</Button>
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
      />
    </div>
  );
}
