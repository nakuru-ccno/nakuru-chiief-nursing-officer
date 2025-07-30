import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatISO } from "date-fns";

const localizer = momentLocalizer(moment);

const recurrenceOptions = ["None", "Daily", "Weekly", "Monthly"];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
    recurrence: "None",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase.from("calendar_events").select("*");
    if (error) {
      toast.error("Failed to load events");
    } else {
      const formatted = data.map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
      setEvents(formatted);
    }
  }

  const handleSelectSlot = ({ start, end }) => {
    setForm({
      title: "",
      description: "",
      start,
      end,
      recurrence: "None",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const event = {
      title: form.title,
      description: form.description,
      start: formatISO(form.start),
      end: formatISO(form.end),
      recurrence: form.recurrence,
    };

    const { error } = await supabase.from("calendar_events").insert([event]);
    if (error) {
      toast.error("Failed to save event");
    } else {
      toast.success("Event added");
      setModalOpen(false);
      fetchEvents();
    }
  };

  const renderRecurringLabel = (event) => {
    if (!event.recurrence || event.recurrence === "None") return "";
    return `🔁 ${event.recurrence}`;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Event Calendar</h2>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        selectable
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        onSelectSlot={handleSelectSlot}
        components={{
          event: ({ event }) => (
            <span>
              {event.title} {renderRecurringLabel(event)}
            </span>
          ),
        }}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-screen overflow-y-auto">
          <div className="space-y-4 p-2">
            <h3 className="text-lg font-semibold">Add Event</h3>

            <div>
              <label className="block mb-1">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-1">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-1">Start</label>
              <Input
                type="datetime-local"
                value={moment(form.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setForm({ ...form, start: new Date(e.target.value) })}
              />
            </div>

            <div>
              <label className="block mb-1">End</label>
              <Input
                type="datetime-local"
                value={moment(form.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setForm({ ...form, end: new Date(e.target.value) })}
              />
            </div>

            <div>
              <label className="block mb-1">Repeat</label>
              <select
                className="w-full border rounded p-2"
                value={form.recurrence}
                onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
              >
                {recurrenceOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSubmit}>Save Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
