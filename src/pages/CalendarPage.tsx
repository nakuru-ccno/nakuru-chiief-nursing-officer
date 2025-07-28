import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, Event as CalendarEvent } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { localizer } from "@/lib/calendarUtils";
import { supabase } from "@/integrations/supabase/client";
import { formatISO, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import "@/components/ui/calendar.css";

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
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // default +1hr
  });

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) setUserEmail(userData.user.email || "");

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
    if (!newEvent.title.trim()) return alert("Title is required");

    const { error } = await supabase.from("events").insert({
      title: newEvent.title,
      description: newEvent.description,
      start_time: formatISO(newEvent.start),
      end_time: formatISO(newEvent.end),
      user_email: userEmail,
    });

    if (error) {
      console.error("Insert error:", error);
      return;
    }

    const { error: fnError } = await supabase.functions.invoke("send-calendar-email", {
      body: {
        title: newEvent.title,
        description: newEvent.description,
        start: newEvent.start.toISOString(),
        email: userEmail,
      },
    });

    if (fnError) {
      console.error("Failed to send email:", fnError.message);
    }

    setShowModal(false);
    window.location.reload();
  };

  const handleTimeChange = (type: "start" | "end", timeString: string) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const newDate = new Date(newEvent[type]);
    newDate.setHours(hour, minute);
    setNewEvent({ ...newEvent, [type]: newDate });
  };

  return (
    <div className="p-4 dark:bg-black min-h-screen text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">🗓 Event Calendar</h2>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />

      <button
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        onClick={() => setShowModal(true)}
      >
        ➕ Add Event
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold">Create New Event</h3>

            <input
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />

            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800"
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <Calendar
                mode="single"
                selected={newEvent.start}
                onSelect={(date) => date && setNewEvent({ ...newEvent, start: date })}
              />
              <input
                type="time"
                className="w-full border p-2 rounded mt-2 dark:bg-gray-800 dark:border-gray-600"
                value={format(newEvent.start, "HH:mm")}
                onChange={(e) => handleTimeChange("start", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">End Date</label>
              <Calendar
                mode="single"
                selected={newEvent.end}
                onSelect={(date) => date && setNewEvent({ ...newEvent, end: date })}
              />
              <input
                type="time"
                className="w-full border p-2 rounded mt-2 dark:bg-gray-800 dark:border-gray-600"
                value={format(newEvent.end, "HH:mm")}
                onChange={(e) => handleTimeChange("end", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddEvent}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
