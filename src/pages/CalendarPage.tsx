import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, Event as CalendarEvent } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { localizer } from "@/lib/calendarUtils";
import { supabase } from "@/integrations/supabase/client";
import { formatISO, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import "@/components/ui/calendar.css"; // Optional: custom styles

type Event = {
  id?: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
};

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) setUserEmail(userData.user.email || "");

      const { data, error } = await supabase.from("events").select("*");
      if (error) return console.error(error);
      const formatted = data.map((e) => ({
        ...e,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
      }));
      setEvents(formatted);
    };

    fetchUserAndEvents();
  }, []);

  const handleAddEvent = async () => {
    setIsSaving(true);
    const { error } = await supabase.from("events").insert({
      title: newEvent.title,
      description: newEvent.description,
      start_time: formatISO(newEvent.start),
      end_time: formatISO(newEvent.end),
      user_email: userEmail,
    });

    if (error) {
      console.error("Insert error:", error);
      alert("❌ Failed to save event.");
      setIsSaving(false);
      return;
    }

    // ✅ Send email notification
    const { error: fnError } = await supabase.functions.invoke("send-calendar-email", {
      body: {
        title: newEvent.title,
        description: newEvent.description,
        start: newEvent.start.toISOString(),
        email: userEmail,
      },
    });

    if (fnError) {
      console.error("Email error:", fnError.message);
    }

    // Reset and reload
    setShowModal(false);
    setNewEvent({
      title: "",
      description: "",
      start: new Date(),
      end: new Date(),
    });
    setIsSaving(false);
    window.location.reload();
  };

  const handleTimeChange = (
    type: "start" | "end",
    timeString: string
  ) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const newDate = new Date(newEvent[type]);
    newDate.setHours(hour, minute);
    setNewEvent({ ...newEvent, [type]: newDate });
  };

  return (
    <div className="p-4 min-h-screen bg-background text-foreground">
      <h2 className="text-xl font-bold mb-4">🗓 Event Calendar</h2>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />

      {/* Add Event Button */}
      <button
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={() => setShowModal(true)}
      >
        ➕ Add Event
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Create New Event</h3>

            <input
              className="w-full border border-gray-300 p-2 rounded dark:bg-zinc-800"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <textarea
              className="w-full border border-gray-300 p-2 rounded dark:bg-zinc-800"
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />

            {/* Start Date & Time */}
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <Calendar
                mode="single"
                selected={newEvent.start}
                onSelect={(date) =>
                  date && setNewEvent((prev) => ({ ...prev, start: date }))
                }
              />
              <input
                type="time"
                className="w-full border p-2 mt-1 dark:bg-zinc-800"
                value={format(newEvent.start, "HH:mm")}
                onChange={(e) => handleTimeChange("start", e.target.value)}
              />
            </div>

            {/* End Date & Time */}
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <Calendar
                mode="single"
                selected={newEvent.end}
                onSelect={(date) =>
                  date && setNewEvent((prev) => ({ ...prev, end: date }))
                }
              />
              <input
                type="time"
                className="w-full border p-2 mt-1 dark:bg-zinc-800"
                value={format(newEvent.end, "HH:mm")}
                onChange={(e) => handleTimeChange("end", e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={handleAddEvent}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
