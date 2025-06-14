
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Calendar } from "lucide-react";

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

const SORT_OPTIONS = [
  { value: "newest", label: "Date (Newest)" },
  { value: "oldest", label: "Date (Oldest)" },
  { value: "title", label: "Title (A-Z)" },
  { value: "type", label: "Type" },
];

export default function Activities() {
  const [activeTab, setActiveTab] = useState("list");
  const [form, setForm] = useState({
    title: "",
    type: "",
    date: new Date().toISOString().split('T')[0],
    duration: "",
    facility: "HQ",
    description: "",
  });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
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
      const activityData = {
        title: form.title,
        type: form.type,
        date: form.date,
        duration: parseInt(form.duration),
        facility: form.facility,
        description: form.description,
        submitted_by: "Demo User",
      };

      if (editingActivity) {
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingActivity.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Activity updated successfully!",
        });
        setEditingActivity(null);
      } else {
        const { error } = await supabase
          .from('activities')
          .insert([activityData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Activity added successfully!",
        });
      }

      await fetchActivities();
      handleCancel();
      setActiveTab("list");
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

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setForm({
      title: activity.title,
      type: activity.type,
      date: activity.date,
      duration: activity.duration.toString(),
      facility: activity.facility,
      description: activity.description,
    });
    setActiveTab("add");
  };

  const handleDelete = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity deleted successfully!",
      });
      await fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Error deleting activity. Please try again.",
        variant: "destructive",
      });
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
    setEditingActivity(null);
  };

  // Filter and sort activities
  const filteredActivities = activities
    .filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || activity.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "type":
          return a.type.localeCompare(b.type);
        case "newest":
        default:
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#be2251] mb-2">Daily Activities</h2>
          <p className="text-gray-600">Manage and track your administrative activities</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => {
              setActiveTab("add");
              if (!editingActivity) handleCancel();
            }}
            className={`flex items-center gap-2 ${
              activeTab === "add" 
                ? "bg-[#be2251] text-white" 
                : "bg-white text-[#be2251] border border-[#be2251] hover:bg-[#be2251] hover:text-white"
            }`}
          >
            <Plus size={16} />
            {editingActivity ? "Edit Activity" : "Add Activity"}
          </Button>
          
          <Button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 ${
              activeTab === "list" 
                ? "bg-[#be2251] text-white" 
                : "bg-white text-[#be2251] border border-[#be2251] hover:bg-[#be2251] hover:text-white"
            }`}
          >
            <Filter size={16} />
            Filter & Search Activities
          </Button>
        </div>

        {/* Search and Filter Bar - Always Visible */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        {activeTab === "add" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#be2251]">
                {editingActivity ? "Edit Activity" : "Add New Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  />
                </div>

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
                      Duration (minutes) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="Enter duration in minutes"
                      value={form.duration}
                      onChange={(e) => handleChange('duration', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facility" className="text-sm font-medium">
                    Facility
                  </Label>
                  <Input
                    id="facility"
                    type="text"
                    value={form.facility}
                    onChange={(e) => handleChange('facility', e.target.value)}
                  />
                </div>

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
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#fd3572] hover:bg-[#be2251] text-white font-medium px-6"
                  >
                    {isSubmitting ? 'Saving...' : editingActivity ? 'Update Activity' : 'Add Activity'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleCancel();
                      setActiveTab("list");
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "list" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#be2251] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar size={20} />
                  {filteredActivities.length} of {activities.length} activities
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading activities...</p>
                </div>
              ) : filteredActivities.length > 0 ? (
                <div className="space-y-3">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-[#be2251]">{activity.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.type === 'Administrative' ? 'bg-purple-100 text-purple-800' :
                              activity.type === 'Meetings' ? 'bg-blue-100 text-blue-800' :
                              activity.type === 'Training' ? 'bg-green-100 text-green-800' :
                              activity.type === 'Documentation' ? 'bg-yellow-100 text-yellow-800' :
                              activity.type === 'Supervision' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Date: {new Date(activity.date).toLocaleDateString()}</span>
                            <span>Duration: {activity.duration} mins</span>
                            <span>Facility: {activity.facility}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                            <DropdownMenuItem onClick={() => handleEdit(activity)} className="flex items-center gap-2">
                              <Edit size={14} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(activity.id)} 
                              className="flex items-center gap-2 text-red-600"
                            >
                              <Trash2 size={14} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        )}
      </div>
    </div>
  );
}
