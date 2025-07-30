import { useEffect, useState } from "react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatISO } from "date-fns";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    start: "",
    end: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);

  // ✅ Fetch events from Supabase
  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase.from("calendar_events").select("*");
    if (error) {
      toast.error("Failed to load events");
      return;
    }

    const mapped = data.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
    }));

    setEvents(mapped);
  }

  function handleSelectSlot({ start }) {
    setForm({
      id: null,
      title: "",
      description: "",
      start: formatISO(start),
      end: formatISO(start),
    });
    setIsEdit(false);
    setOpen(true);
  }

  function handleSelectEvent(event) {
    setForm({
      id: event.id,
      title: event.title,
      description: event.description || "",
      start: formatISO(event.start),
      end: formatISO(event.end),
    });
    setIsEdit(true);
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.start) {
      toast.error("Title and Date are required");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      date: form.start,
    };

    let result;

    if (isEdit && form.id) {
      result = await supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", form.id);
    } else {
      result = await supabase.from("calendar_events").insert(payload);
    }

    const { error } = result;

    if (error) {
      toast.error("Failed to save event");
    } else {
      toast.success("Event saved");
      setOpen(false);
      fetchEvents();
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📅 Calendar</h1>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        style={{ height: 600 }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        views={["month", "week", "day"] as Views[]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <Input
              type="datetime-local"
              value={form.start?.slice(0, 16)}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
              required
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
