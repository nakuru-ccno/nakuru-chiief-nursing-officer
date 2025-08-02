import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar"; // your styled DayPicker wrapper
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [title, setTitle] = useState("");

  const handleSave = async () => {
    if (!selectedDate || !title.trim()) {
      toast.error("Please provide both a title and a date.");
      return;
    }

    const { error } = await supabase.from("calendar_events").insert({
      title,
      date: selectedDate.toISOString(),
    });

    if (error) {
      console.error("Save error:", error);
      toast.error("Failed to save event.");
    } else {
      toast.success("Event saved successfully.");
      setTitle("");
      setSelectedDate(undefined);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-semibold mb-4">📅 Add Calendar Event</h1>

      {/* Event Title */}
      <Input
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />

      {/* Calendar Picker */}
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
      />

      {/* Save Button */}
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} disabled={!selectedDate || !title.trim()}>
          Save Event
        </Button>
      </div>
    </div>
  );
};

export default CalendarPage;
