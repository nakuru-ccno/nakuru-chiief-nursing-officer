import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    recurrence: "",
  });

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUser();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("calendar_events").select("*");
    if (!error && data) {
      const mapped = data.map((e) => ({
        title: e.title,
        start: new Date(e.start),
        end: new Date(e.end),
        allDay: false,
      }));
      setEvents(mapped);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setForm({
      title: "",
      description: "",
      start: moment(slotInfo.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(slotInfo.end).format("YYYY-MM-DDTHH:mm"),
      recurrence: "",
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.start || !form.end) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { error } = await supabase.from("calendar_events").insert([
      {
        title: form.title,
        description: form.description,
        start: form.start,
        end: form.end,
        recurrence: form.recurrence || null,
        email: userEmail,
      },
    ]);

    if (error) {
      console.error("Failed to save event:", error.message);
      toast.error("Failed to save event");
    } else {
      toast.success("Event saved");
      setShowModal(false);
      fetchEvents();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📅 Calendar</h2>
      <BigCalendar
        selectable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectSlot={handleSelectSlot}
      />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input name="title" value={form.title} onChange={handleInputChange} required />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start</Label>
                <Input type="datetime-local" name="start" value={form.start} onChange={handleInputChange} required />
              </div>
              <div>
                <Label>End</Label>
                <Input type="datetime-local" name="end" value={form.end} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <Label>Recurrence</Label>
              <Input name="recurrence" placeholder="daily, weekly, monthly" value={form.recurrence} onChange={handleInputChange} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
