import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import CountyHeader from "@/components/CountyHeader";
import MainNavbar from "@/components/MainNavbar";
import { toast } from "sonner";

const supabase = createClient(
  "https://fjcwwvjvqtgjwrnobqwf.supabase.co",
  "YOUR_PUBLIC_ANON_KEY" // Replace with env variable in production
);

type Event = {
  id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  user_id: string;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "" });

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("❌ User not logged in");
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("calendar")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) {
        console.error("❌ Failed to load events:", error.message);
      } else {
        setEvents(data as Event[]);
      }

      setLoading(false);
    };

    fetchUserAndEvents();
  }, []);

  const handleAddEvent = async () => {
    if (!form.title || !form.date || !currentUserId) {
      toast.error("Please fill in all fields");
      return;
    }

    const { data, error } = await supabase.from("calendar").insert([
      {
        title: form.title,
        description: form.description,
        date: form.date,
        start_time: "00:00",
        end_time: "23:59",
        user_id: currentUserId,
      },
    ]);

    if (error) {
      toast.error("Failed to add event.");
      return;
    }

    // ✅ Send Email Notification
    await fetch("/functions/v1/send-calendar-email", {
      method: "POST",
      body: JSON.stringify({
        email: (await supabase.auth.getUser()).data.user?.email,
        title: form.title,
        description: form.description,
        date: form.date,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.success("Event successfully added to your agenda!");
    setForm({ title: "", description: "", date: "" });
    setShowForm(false);

    // Refresh events
    const { data: newEvents } = await supabase
      .from("calendar")
      .select("*")
      .eq("user_id", currentUserId)
      .order("date", { ascending: true });

    setEvents(newEvents as Event[]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">
            📅 My Scheduled Events
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Add Event
          </button>
        </div>

        {showForm && (
          <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm space-y-4">
            <input
              type="text"
              placeholder="Event Title"
              className="w-full p-2 border rounded"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Event Description"
              className="w-full p-2 border rounded"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddEvent}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ✅ Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500">No events available.</p>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => {
              const isPast = new Date(event.date) < new Date();
              return (
                <div
                  key={event.id}
                  className={`rounded-2xl p-5 border shadow-sm ${
                    isPast
                      ? "bg-gray-100 border-gray-200 text-gray-500"
                      : "bg-white border-blue-100"
                  }`}
                >
                  <h2 className="text-xl font-semibold text-blue-800 mb-2">
                    {event.title}
                  </h2>
                  <p className="text-gray-600">
                    {format(new Date(event.date), "EEEE, MMMM d, yyyy")} —{" "}
                    {event.start_time} to {event.end_time}
                  </p>
                  {event.description && (
                    <p className="mt-2 text-gray-700">{event.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
