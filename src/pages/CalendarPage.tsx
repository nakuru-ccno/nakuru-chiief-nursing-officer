import { useEffect, useState } from "react"
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

const localizer = momentLocalizer(moment)

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [open, setOpen] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [form, setForm] = useState({
    title: "",
    start: "",
    end: "",
    date: "",
    recurrence: "",
    description: "",
  })

  useEffect(() => {
    fetchEvents()
    fetchUserEmail()
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase.from("calendar_events").select("*")
    if (error) {
      toast.error("Failed to load events")
      return
    }

    const mapped = data.map((event) => ({
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
    }))
    setEvents(mapped)
  }

  async function fetchUserEmail() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user?.email) {
      setUserEmail(session.user.email)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      title: form.title,
      start: form.start,
      end: form.end,
      date: form.date,
      recurrence: form.recurrence,
      description: form.description,
      email: userEmail,
    }

    const { error } = await supabase.from("calendar_events").insert(payload)

    if (error) {
      console.error("Insert Error:", error)
      toast.error("Failed to save event")
      return
    }

    toast.success("Event saved!")
    setOpen(false)
    setForm({
      title: "",
      start: "",
      end: "",
      date: "",
      recurrence: "",
      description: "",
    })
    fetchEvents()
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Calendar</h2>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={(slotInfo) => {
          const date = moment(slotInfo.start).format("YYYY-MM-DD")
          setForm((prev) => ({ ...prev, date }))
          setOpen(true)
        }}
        style={{ height: 600 }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4">Add Event</Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label>Event Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>End</Label>
                <Input
                  type="datetime-local"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Recurrence</Label>
              <Select
                value={form.recurrence}
                onValueChange={(val) => setForm({ ...form, recurrence: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
