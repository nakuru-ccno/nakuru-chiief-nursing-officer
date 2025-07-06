
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityType {
  id: string;
  name: string;
  is_active: boolean;
}

interface ActivityFormProps {
  activityTypes: ActivityType[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  activityTypes,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [facility, setFacility] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type || !date) {
      alert("Please fill in required fields.");
      return;
    }

    // Get current user email
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email || "Current User";

    const activityData = {
      title,
      type,
      date,
      duration: duration ? parseInt(duration, 10) : undefined,
      facility,
      description,
      submitted_by: userEmail,
    };

    console.log('🔄 ActivityForm - Submitting activity:', activityData);
    onSubmit(activityData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Activity title"
          required
        />
      </div>

      <div>
        <Label>Activity Type *</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-400"
        >
          <option value="">Select a type</option>
          {activityTypes.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Date *</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Duration (minutes)</Label>
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g., 60"
        />
      </div>

      <div>
        <Label>Facility</Label>
        <Input
          value={facility}
          onChange={(e) => setFacility(e.target.value)}
          placeholder="e.g., Nakuru County Hospital"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the activity (optional)"
        />
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Activity"}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
