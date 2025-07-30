
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export default function AddEventDialog({ onEventAdded }: { onEventAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [recurrence, setRecurrence] = useState("");
  const [open, setOpen] = useState(false);

  const session = useSession();

  // Auto-fill with current datetime
  useEffect(() => {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const toDatetimeLocal = (dt: Date) =>
      dt.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
    setStart(toDatetimeLocal(now));
    setEnd(toDatetimeLocal(inOneHour));
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRecurrence("");
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!title || !start || !end || !session?.user?.email) {
      toast.error("All fields are required.");
      return;
    }

    const { error } = await supabase
      .from("public.calendar_events") // Ensure correct schema
      .insert({
        title,
        description,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
        email: session.user.email,
        recurrence: recurrence || null,
      });

    if (error) {
      console.error("Insert Error:", error);
      toast.error(`Failed to save event: ${error.message}`);
      return;
    }

    toast.success("Event saved!");
    resetForm();
    onEventAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogDescription>Enter event details below.</DialogDescription>

        <label className="text-sm mt-2">Event Title</label>
        <Input
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="text-sm mt-2">Description</label>
        <Textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="text-sm mt-2">Start Time</label>
        <Input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <label className="text-sm mt-2">End Time</label>
        <Input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />

        <label className="text-sm mt-2">Recurrence</label>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">No recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit}>Save Event</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
