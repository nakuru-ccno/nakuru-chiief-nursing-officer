import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, Event as CalendarEvent } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { localizer } from "@/lib/calendarUtils";
import { supabase } from "@/integrations/supabase/client";
import { formatISO, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
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
    const { error } = await supabase.from("events").insert({
      title: newEvent.title,
      description: newEvent.description,
      start_time: formatISO(newEvent.start),
      end_time: formatISO(newEvent.end),
      user_email: userEmail,
    });

    if (error) {
      toast.error("Failed to save event.");
      console.error("Insert error:", error);
      return;
    }

    toast.success("✅ Event saved and email sent!");

    // 🔔 Send email to user
    const { error: fnError } = await supabase.functions.invoke("send-calendar-email", {
      body: {
        title: newEvent.title,
        description: newEvent.description,
        start: newEvent.start.toISOString(),
        email: userEmail,
      },
    });

    // 🔔 Optional: Notify admin
    await supabase.functions.invoke("send-calendar-email", {
      body: {
        title: newEvent.title,
        description: newEvent.description,
        start: newEvent.start.toISOString(),
        email: "ccno@nakurucountychiefnursingofficer.site",
        fromUser: userEmail,
      },
    });

    if (fnError) {
      toast.warning("Saved, but email failed.");
      console.error("Email error:", fnError.message);
    }

    setShowModal(false);
    setNewEvent({
      title: "",
      description: "",
      start: new Date(),
      end: new Date(),
    });
    setTimeout(() => window.location.reload(), 800); // refresh calendar
  };

  const handleTimeChange = (type: "start" | "end", timeString: string) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const newDate = new Date(newEvent[type]);
    newDate.setHours(hour, minute);
    setNewEvent({ ...newEvent, [type]: newDate });
  };

  return (
    <div className="p-4 dark:bg-black dark:text-white min-h-screen">
      {/* Header and Add Event Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🗓 Event Calendar</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          ➕ Add Event
        </button>
      </div>

      {/* Calendar */}
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 dark:text-white p-6 rounded-xl shadow-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold">Create New Event</h3>
            <input
              className="w-full border p-2 rounded dark:bg-gray-800"
              placeholder="Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <textarea
              className="w-full border p-2 rounded dark:bg-gray-800"
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <Calendar
                mode="single"
                selected={newEvent.start}
                onSelect={(date) => date && setNewEvent((prev) => ({ ...prev, start: date }))}
              />
              <input
                type="time"
                className="w-full border p-2 mt-1 rounded dark:bg-gray-800"
                value={format(newEvent.start, "HH:mm")}
                onChange={(e) => handleTimeChange("start", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">End Date</label>
              <Calendar
                mode="single"
                selected={newEvent.end}
                onSelect={(date) => date && setNewEvent((prev) => ({ ...prev, end: date }))}
              />
              <input
                type="time"
                className="w-full border p-2 mt-1 rounded dark:bg-gray-800"
                value={format(newEvent.end, "HH:mm")}
                onChange={(e) => handleTimeChange("end", e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
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
