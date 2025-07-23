import React, { useEffect, useState } from "react";
import { Calendar, Event as CalendarEvent } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { localizer } from "@/lib/calendarUtils";
import { supabase } from "@/integrations/supabase/client";
import { formatISO } from "date-fns";

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

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) return console.error(error);
      const formatted = data.map((e) => ({
        ...e,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
      }));
      setEvents(formatted);
    };
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    const { error } = await supabase.from("events").insert({
      title: newEvent.title,
      description: newEvent.description,
      start_time: formatISO(newEvent.start),
      end_time: formatISO(newEvent.end),
    });

    if (error) {
      console.error("Insert error:", error);
      return;
    }

    setShowModal(false);
    window.location.reload(); // or re-fetch
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🗓 Event Calendar</h2>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setShowModal(true)}
      >
        ➕ Add Event
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Create New Event</h3>
            <input
              className="w-full border p-2 mb-2"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <input
              className="w-full border p-2 mb-2"
              type="datetime-local"
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: new Date(e.target.value) })
              }
            />
            <input
              className="w-full border p-2 mb-2"
              type="datetime-local"
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: new Date(e.target.value) })
              }
            />
            <button className="bg-green-600 text-white px-4 py-2" onClick={handleAddEvent}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
