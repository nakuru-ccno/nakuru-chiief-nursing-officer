import React, { useEffect, useState } from "react";
import { Calendar, Event as CalendarEvent } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { localizer } from "@/lib/calendarUtils";
import { supabase } from "@/integrations/supabase/client";
import { formatISO } from "date-fns";
import { NavigationMenu } from "@/components/NavigationMenu";

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
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
  });
  const [userEmail, setUserEmail] = useState("");

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
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      alert("Please fill in all required fields.");
      return;
    }

    const { data, error } = await supabase.from("events").insert({
      title: newEvent.title,
      description: newEvent.description,
      start_time: formatISO(newEvent.start),
      end_time: formatISO(newEvent.end),
      user_email: userEmail,
    }).select("*");

    if (error) {
      console.error("Insert error:", error);
      return;
    }

    const inserted = data?.[0];

    // 🔔 Trigger email notification
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

    setEvents([
      ...events,
      {
        ...inserted,
        start: new Date(inserted.start_time),
        end: new Date(inserted.end_time),
      },
    ]);

    setShowModal(false);
    setNewEvent({
      title: "",
      description: "",
      start: new Date(),
      end: new Date(),
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavigationMenu />

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-4">🗓 Event Calendar</h2>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />

        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          ➕ Add Event
        </button>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Create New Event</h3>

            <input
              className="w-full border p-2 mb-3 rounded"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <textarea
              className="w-full border p-2 mb-3 rounded"
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
            <label className="text-sm font-medium text-black dark:text-white">Start Time</label>
            <input
              className="w-full border p-2 mb-3 rounded"
              type="datetime-local"
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: new Date(e.target.value) })
              }
            />
            <label className="text-sm font-medium text-black dark:text-white">End Time</label>
            <input
              className="w-full border p-2 mb-3 rounded"
              type="datetime-local"
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: new Date(e.target.value) })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
