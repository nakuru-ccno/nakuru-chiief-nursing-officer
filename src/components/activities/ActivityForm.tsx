
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface ActivityFormProps {
  activityTypes: ActivityType[];
  onSubmit: (formData: any) => void;
  isSubmitting: boolean;
}

const ActivityForm = ({ activityTypes, onSubmit, isSubmitting }: ActivityFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: new Date(),
    duration: "",
    location: "",
    description: ""
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Title */}
        <div className="space-y-3">
          <Label htmlFor="title" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            Activity Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="Enter a descriptive activity title"
            className="h-14 text-lg border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
            required
          />
        </div>

        {/* Activity Type */}
        <div className="space-y-3">
          <Label htmlFor="type" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            Activity Type *
          </Label>
          <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
            <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-orange-500 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-200 shadow-2xl rounded-xl max-h-80 overflow-y-auto">
              {activityTypes.length > 0 ? (
                activityTypes.map((type) => (
                  <SelectItem 
                    key={type.id} 
                    value={type.name} 
                    className="cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 py-4 px-4 rounded-lg mx-1 my-1 transition-all duration-200"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{type.name}</div>
                      {type.description && (
                        <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-types" disabled className="text-gray-500 py-4 px-4">
                  No activity types available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-green-600" />
            Date *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-14 w-full justify-start text-left text-lg border-2 border-gray-200 hover:border-orange-500 transition-all duration-200 bg-white rounded-xl shadow-sm hover:shadow-md",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-3 h-5 w-5 text-orange-600" />
                {formData.date ? format(formData.date, "EEEE, MMMM do, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border-2 border-gray-200 shadow-2xl rounded-xl">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => date && updateFormData('date', date)}
                initialFocus
                className="rounded-xl"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <Label htmlFor="duration" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Duration (minutes)
          </Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => updateFormData('duration', e.target.value)}
            placeholder="Enter duration in minutes"
            className="h-14 text-lg border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
            min="1"
          />
        </div>
      </div>

      {/* Location - Full Width */}
      <div className="space-y-3">
        <Label htmlFor="location" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-600" />
          Location / Facility
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => updateFormData('location', e.target.value)}
          placeholder="e.g., HQ, Nakuru Level 5 Hospital, Field Office, Community Center"
          className="h-14 text-lg border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
        />
      </div>

      {/* Description - Full Width */}
      <div className="space-y-3">
        <Label htmlFor="description" className="text-lg font-semibold text-gray-800">
          Additional Details (Optional)
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Provide additional details about the activity, objectives, outcomes, or any other relevant information..."
          className="min-h-[140px] text-lg border-2 border-gray-200 focus:border-orange-500 transition-all duration-200 resize-none rounded-xl shadow-sm hover:shadow-md"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-16 text-xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 hover:from-orange-700 hover:via-red-600 hover:to-pink-700 text-white shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting Activity...</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <PlusCircle className="w-7 h-7" />
              <span>Submit Activity</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
