import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSession";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const { session } = useSession();
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    description: "",
    recurrence: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase.from("calendar_events").select("*");
    if (!error && data) {
      setEvents(
        data.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))
      );
    }
  }

  function handleSelectEvent(event) {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
      description: event.description || "",
      recurrence: event.recurrence || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!formData.title || !formData.start || !formData.end) return;
    const payload = {
      title: formData.title,
      start: formData.start,
      end: formData.end,
      description: formData.description,
      recurrence: formData.recurrence,
      email: session?.user?.email,
    };

    if (editingEvent) {
      const { error } = await supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", editingEvent.id);
      if (!error) {
        setEditingEvent(null);
      }
    } else {
      const { error } = await supabase.from("calendar_events").insert(payload);
      if (error) {
        console.error("Insert Error:", error);
        return;
      }
    }

    fetchEvents();
    setModalOpen(false);
    setFormData({ title: "", start: "", end: "", description: "", recurrence: "" });
  }

  async function handleDelete() {
    if (editingEvent) {
      await supabase.from("calendar_events").delete().eq("id", editingEvent.id);
      setEditingEvent(null);
      setModalOpen(false);
      fetchEvents();
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <Button className="mb-4" onClick={() => setModalOpen(true)}>
        Add Event
      </Button>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectEvent={handleSelectEvent}
      />

      <Dialog open={modalOpen} onOpenChange={(v) => {
        if (!v) setEditingEvent(null);
        setModalOpen(v);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update the event details." : "Fill in the form below to create a new calendar event."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Event Title</Label>
              <Input
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              />
            </div>

            <div>
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              />
            </div>

            <div>
              <Label>Recurrence</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.recurrence}
                onChange={(e) =>
                  setFormData({ ...formData, recurrence: e.target.value })
                }
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Event description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex justify-between items-center">
            <div>
              {editingEvent && (
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingEvent ? "Update Event" : "Save Event"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
