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
import { useSession } from "@/hooks/useSession"; // or however you get session

export default function AddEventDialog({ onEventAdded }: { onEventAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [recurrence, setRecurrence] = useState("");
  const [open, setOpen] = useState(false);

  const session = useSession(); // Make sure session?.user?.email is available

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStart("");
    setEnd("");
    setRecurrence("");
  };

  const handleSubmit = async () => {
    if (!title || !start || !end || !session?.user?.email) {
      toast.error("All fields including your login email are required.");
      return;
    }

    const { error } = await supabase.from("calendar_events").insert({
      title,
      description,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      email: session.user.email,
      recurrence: recurrence || null,
    });

    if (error) {
      console.error("Insert Error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      toast.error(`Failed to save event: ${error.message}`);
      return;
    }

    toast.success("Event saved successfully!");
    resetForm();
    setOpen(false);
    onEventAdded(); // to refresh calendar
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogDescription>
          Fill in the form to create a new calendar event.
        </DialogDescription>

        <Input
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <Input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">No recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <Button onClick={handleSubmit}>Save Event</Button>
      </DialogContent>
    </Dialog>
  );
}
