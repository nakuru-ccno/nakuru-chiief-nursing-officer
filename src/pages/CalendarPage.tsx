import { useEffect, useState } from "react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

interface CalendarEvent extends RBCEvent {
  id: string;
  email: string;
  description?: string;
  recurrence?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    start: "",
    end: "",
    recurrence: "",
    description: "",
  });

  const { user } = useSession();
  const userEmail = user?.email || "";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("calendar_events").select("*");
    if (error) {
      toast.error("Failed to fetch events");
    } else {
      const parsed = data.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(parsed);
    }
  };

  const handleSelectSlot = (slotInfo: any) => {
    setForm({
      title: "",
      start: moment(slotInfo.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(slotInfo.end).format("YYYY-MM-DDTHH:mm"),
      recurrence: "",
      description: "",
    });
    setShowModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.start || !form.end) {
      toast.error("Title, start, and end are required");
      return;
    }

    const { error } = await supabase.from("calendar_events").insert({
      title: form.title,
      start: new Date(form.start),
      end: new Date(form.end),
      recurrence: form.recurrence,
      description: form.description,
      email: userEmail,
    });

    if (error) {
      toast.error("Failed to save event");
    } else {
      toast.success("Event saved successfully");
      setShowModal(false);
      setForm({
        title: "",
        start: "",
        end: "",
        recurrence: "",
        description: "",
      });
      fetchEvents();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        selectable
        onSelectSlot={handleSelectSlot}
      />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Event Title</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  name="start"
                  value={form.start}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label>End</Label>
                <Input
                  type="datetime-local"
                  name="end"
                  value={form.end}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Recurrence (e.g., daily, weekly)</Label>
              <Input
                name="recurrence"
                value={form.recurrence}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
