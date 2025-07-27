// src/pages/CalendarPage.tsx
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useSession } from "@/hooks/useSession" // your auth hook

const supabase = createClient(
  "https://fjcwwvjvqtgjwrnobqwf.supabase.co",
  "YOUR_PUBLIC_ANON_KEY" // replace with your key
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
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
  })

  const { session } = useSession()
  const userEmail = session?.user.email

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

  const handleAddEvent = async () => {
    const { title, description, date, start_time, end_time } = form
    if (!title || !date || !start_time || !end_time) {
      toast.error("Please fill in all required fields")
      return
    }

    const { data, error } = await supabase
      .from("calendar")
      .insert([{ title, description, date, start_time, end_time }])

    if (error) {
      console.error(error)
      toast.error("Failed to add event")
      return
    }

    // Send email via Edge Function
    await fetch("https://fjcwwvjvqtgjwrnobqwf.supabase.co/functions/v1/send-calendar-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        email: userEmail,
        event: { title, description, date, start_time, end_time },
      }),
    })

    toast.success("Event successfully added to agenda")
    setForm({ title: "", description: "", date: "", start_time: "", end_time: "" })
    setOpen(false)
    setEvents(prev => [...prev, { id: "", ...form }])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">📅 Upcoming Events</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent className="grid gap-4">
            <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="flex gap-2">
              <Input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
              <Input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <Button onClick={handleAddEvent}>Save Event</Button>
          </DialogContent>
        </Dialog>
      </div>

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
                  isPast ? "bg-gray-100 border-gray-200 text-gray-500" : "bg-white border-blue-100"
                }`}
              >
                <h2 className="text-xl font-semibold text-blue-800 mb-2">{event.title}</h2>
                <p className="text-gray-600">
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")} — {event.start_time} to {event.end_time}
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
