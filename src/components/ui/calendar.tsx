import { useEffect, useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("calendar_events").select("*");
      if (!error && data) {
        const formatted = data.map((event) => ({
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
        }));
        setEvents(formatted);
      }
    };
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    if (!title || !selectedDate) {
      toast.error("Please fill in the title and date.");
      return;
    }

    const endDate = new Date(selectedDate);
    endDate.setHours(selectedDate.getHours() + 1); // 1 hour duration

    const { error } = await supabase.from("calendar_events").insert({
      title,
      description,
      start_time: selectedDate.toISOString(),
      end_time: endDate.toISOString(),
    });

    if (error) {
      toast.error("Failed to add event.");
    } else {
      toast.success("Event added!");
      setEvents((prev) => [
        ...prev,
        { title, start: selectedDate, end: endDate },
      ]);
      setTitle("");
      setDescription("");
      setSelectedDate(undefined);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Event Calendar</h1>

      {/* 🔧 Add Event Form */}
      <div className="bg-white p-4 rounded-xl shadow space-y-4 max-w-xl">
        <Input
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left">
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleAddEvent}>Create Event</Button>
      </div>

      {/* 📅 Calendar Display */}
      <div className="bg-white rounded-xl shadow p-4">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "70vh" }}
        />
      </div>
    </div>
  );
}
