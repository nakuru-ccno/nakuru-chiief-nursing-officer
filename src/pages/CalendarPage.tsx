// src/pages/CalendarPage.tsx
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
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    recurrence: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchEvents();
    fetchEmail();
  }, []);

  const fetchEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("calendar_events").select("*");
    if (!error && data) {
      setEvents(data.map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      })));
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setFormData({
      title: "",
      description: "",
      start: moment(start).format("YYYY-MM-DDTHH:mm"),
      end: moment(end).format("YYYY-MM-DDTHH:mm"),
      recurrence: "",
    });
    setDialogOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
      recurrence: event.recurrence || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.start || !formData.end) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
      recurrence: formData.recurrence,
      email: userEmail,
    };

    let result;

    if (selectedEvent) {
      result = await supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", selectedEvent.id);
    } else {
      result = await supabase.from("calendar_events").insert([payload]);
    }

    if (result.error) {
      toast.error("Failed to save event: " + result.error.message);
    } else {
      toast.success("Event saved successfully");
      setDialogOpen(false);
      fetchEvents();
    }
  };

  return (
    <div className="p-4">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        style={{ height: 600 }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="hidden">Trigger</Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-lg">
          <h2 className="text-xl font-semibold mb-4">
            {selectedEvent ? "Edit Event" : "Add Event"}
          </h2>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                value={formData.start}
                onChange={(e) =>
                  setFormData({ ...formData, start: e.target.value })
                }
                required
              />
              <Input
                type="datetime-local"
                value={formData.end}
                onChange={(e) =>
                  setFormData({ ...formData, end: e.target.value })
                }
                required
              />
            </div>
            <Input
              placeholder="Recurrence (e.g. daily, weekly)"
              value={formData.recurrence}
              onChange={(e) =>
                setFormData({ ...formData, recurrence: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
