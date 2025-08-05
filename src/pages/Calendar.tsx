// src/pages/Calendar.tsx
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useSession } from "@/hooks/useSession"

type Event = {
  id: string
  title: string
  description?: string
  start: string
  end: string
  email: string
  user_id: string
  created_at: string
}

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
  })

  const { user } = useSession()

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq('user_id', user?.id)
        .order("start", { ascending: true })

      if (error) {
        console.error('Error fetching events:', error)
        toast.error('Failed to load events')
      } else {
        setEvents(data as Event[])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async () => {
    const { title, description, start, end } = form
    if (!title || !start || !end) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!user) {
      toast.error("You must be logged in to create events")
      return
    }

    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert([{ 
          title, 
          description, 
          start, 
          end,
          email: user.email,
          user_id: user.id
        }])
        .select()

      if (error) {
        console.error('Database error:', error)
        toast.error(`Failed to add event: ${error.message}`)
        return
      }

      // Send email notification
      try {
        await supabase.functions.invoke('send-calendar-email', {
          body: {
            email: user.email,
            event: { 
              title, 
              description, 
              date: start.split('T')[0],
              start_time: start.split('T')[1],
              end_time: end.split('T')[1]
            },
          },
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
        // Don't show error to user since event was saved successfully
      }

      toast.success("Event successfully added!")
      setForm({ title: "", description: "", start: "", end: "" })
      setOpen(false)
      await fetchEvents() // Reload events
    } catch (error) {
      console.error('Error adding event:', error)
      toast.error("Failed to add event")
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">📅 Calendar</h1>
          <p className="text-gray-600">Please log in to view your calendar events.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">📅 Calendar Events</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent className="grid gap-4">
            <h2 className="text-xl font-semibold">Add New Event</h2>
            <Input 
              placeholder="Event Title" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
            />
            <Textarea 
              placeholder="Description (optional)" 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
            />
            <div className="grid gap-2">
              <label className="text-sm font-medium">Start Date & Time</label>
              <Input 
                type="datetime-local" 
                value={form.start} 
                onChange={e => setForm({ ...form, start: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">End Date & Time</label>
              <Input 
                type="datetime-local" 
                value={form.end} 
                onChange={e => setForm({ ...form, end: e.target.value })} 
              />
            </div>
            <Button onClick={handleAddEvent} disabled={!form.title || !form.start || !form.end}>
              Save Event
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No events found.</p>
          <Button onClick={() => setOpen(true)}>Create Your First Event</Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map(event => {
            const startDate = new Date(event.start)
            const endDate = new Date(event.end)
            const isPast = startDate < new Date()
            
            return (
              <div
                key={event.id}
                className={`rounded-2xl p-5 border shadow-sm ${
                  isPast ? "bg-gray-100 border-gray-200 text-gray-500" : "bg-white border-blue-100"
                }`}
              >
                <h2 className="text-xl font-semibold text-blue-800 mb-2">{event.title}</h2>
                <p className="text-gray-600">
                  {format(startDate, "EEEE, MMMM d, yyyy")} — {format(startDate, "h:mm a")} to {format(endDate, "h:mm a")}
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
