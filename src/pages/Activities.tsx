
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Activity = {
  id: string;
  date: string;
  facility: string;
  title: string;
  type: string;
  duration: number;
  description: string;
  submitted_by: string;
  submitted_at: string;
};

const ACTIVITY_TYPES = [
  "Administrative",
  "Meetings",
  "Training",
  "Documentation",
  "Supervision",
  "Other",
];

export default function Activities() {
  const [activeTab, setActiveTab] = useState("add");
  const [form, setForm] = useState({
    title: "",
    type: "",
    date: new Date().toISOString().split('T')[0],
    duration: "",
    facility: "HQ",
    description: "",
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  // Load activities from Supabase on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      // Use type assertion to bypass TypeScript error
      const { data, error } = await (supabase as any)
        .from('activities')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities from database",
          variant: "destructive",
        });
        return;
      }

      console.log('Loaded activities from Supabase:', data);
      setActivities((data as Activity[]) || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.type || !form.date || !form.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newActivity = {
        title: form.title,
        type: form.type,
        date: form.date,
        duration: parseInt(form.duration),
        facility: form.facility,
        description: form.description,
        submitted_by: "Demo User",
      };

      // Use type assertion to bypass TypeScript error
      const { data, error } = await (supabase as any)
        .from('activities')
        .insert([newActivity])
        .select();

      if (error) {
        console.error('Error saving activity:', error);
        toast({
          title: "Error",
          description: "Error saving activity to database. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Activity saved to Supabase:', data);
      
      // Refresh activities list
      await fetchActivities();

      // Reset form
      setForm({
        title: "",
        type: "",
        date: new Date().toISOString().split('T')[0],
        duration: "",
        facility: "HQ",
        description: "",
      });

      toast({
        title: "Success",
        description: "Activity added successfully and synced across devices!",
      });
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: "Error",
        description: "Error saving activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm({
      title: "",
      type: "",
      date: new Date().toISOString().split('T')[0],
      duration: "",
      facility: "HQ",
      description: "",
    });
  };

  // Filter activities based on search term and type
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || activity.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#be2251] mb-2">Daily Activities</h2>
          <p className="text-gray-600">Manage and track your administrative activities across all devices</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "add"
                ? "border-[#be2251] text-[#be2251]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Add Activity
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "search"
                ? "border-[#be2251] text-[#be2251]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Filter & Search Activities
          </button>
        </div>

        {/* Add Activity Tab */}
        {activeTab === "add" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#be2251]">Activity Details</CardTitle>
              <p className="text-sm text-gray-600">Fill in the details of your daily activity</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Activity Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Activity Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter activity title"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {/* Activity Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Activity Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={form.type} onValueChange={(value) => handleChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Duration Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="Enter duration in minutes"
                      value={form.duration}
                      onChange={(e) => handleChange('duration', e.target.value)}
                    />
                  </div>
                </div>

                {/* Facility */}
                <div className="space-y-2">
                  <Label htmlFor="facility" className="text-sm font-medium">
                    Facility
                  </Label>
                  <Input
                    id="facility"
                    type="text"
                    value={form.facility}
                    onChange={(e) => handleChange('facility', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the activity details..."
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#fd3572] hover:bg-[#be2251] text-white font-medium px-6"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Activity'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filter & Search Activities Tab */}
        {activeTab === "search" && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#be2251]">Search & Filter</CardTitle>
                <p className="text-sm text-gray-600">Find specific activities using search and filters</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-sm font-medium">
                      Search Activities
                    </Label>
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter" className="text-sm font-medium">
                      Filter by Type
                    </Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {ACTIVITY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activities List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#be2251]">
                  Activities ({filteredActivities.length})
                </CardTitle>
                <p className="text-sm text-gray-600">Your recorded activities synced across all devices</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading activities from database...</p>
                  </div>
                ) : filteredActivities.length > 0 ? (
                  <div className="space-y-3">
                    {filteredActivities.map((activity) => (
                      <div key={activity.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-[#be2251]">{activity.title}</h4>
                          <span className="text-sm text-gray-500">{activity.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Type: {activity.type}</span>
                          <span>Duration: {activity.duration} mins</span>
                          <span>Facility: {activity.facility}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No activities found matching your criteria.</p>
                    {searchTerm || filterType !== "all" ? (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterType("all");
                        }}
                        className="mt-2 text-[#be2251] hover:underline"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab("add")}
                        className="mt-2 text-[#be2251] hover:underline"
                      >
                        Add your first activity
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
