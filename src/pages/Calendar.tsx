// src/pages/Calendar.tsx or src/pages/calendar.jsx

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { format } from "date-fns"

const supabase = createClient(
  "https://fjcwwvjvqtgjwrnobqwf.supabase.co",
  "YOUR_PUBLIC_ANON_KEY" // replace with your actual anon key
)

type Event = {
  id: string
  title: string
  description?: string
  date: string
  start_time: string
  end_time: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("calendar")
        .select("*")
        .order("date", { ascending: true })

      if (error) console.error(error)
      else setEvents(data as Event[])
      setLoading(false)
    }

    fetchEvents()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">📅 Upcoming Events</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events available.</p>
      ) : (
        <div className="grid gap-6">
          {events.map(event => {
            const isPast = new Date(event.date) < new Date()
            return (
              <div
                key={event.id}
                className={`rounded-2xl p-5 border shadow-sm ${
                  isPast
                    ? "bg-gray-100 border-gray-200 text-gray-500"
                    : "bg-white border-blue-100"
                }`}
              >
                <h2 className="text-xl font-semibold text-blue-800 mb-2">{event.title}</h2>
                <p className="text-gray-600">
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")} — {event.start_time} to{" "}
                  {event.end_time}
                </p>
                {event.description && <p className="mt-2 text-gray-700">{event.description}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
