
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import ExportTabs from "./ExportTabs";

interface Activity {
  id: string;
  date: string;
  facility: string;
  title: string;
  type: string;
  duration: number;
  description: string;
  submitted_by: string;
  submitted_at: string;
  created_at: string;
}

interface ReportsExportDialogProps {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
}

const ReportsExportDialog: React.FC<ReportsExportDialogProps> = ({
  open,
  onClose,
  activities
}) => {
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activityType, setActivityType] = useState("all");

  // Filter activities based on selected criteria
  const filteredActivities = activities.filter(activity => {
    let dateMatch = true;
    let typeMatch = true;

    // Date filtering
    if (dateRange !== "all") {
      const activityDate = new Date(activity.created_at);
      const now = new Date();
      
      switch (dateRange) {
        case "today":
          dateMatch = activityDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = activityDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = activityDate >= monthAgo;
          break;
        case "custom":
          if (startDate && endDate) {
            dateMatch = activityDate >= startDate && activityDate <= endDate;
          }
          break;
      }
    }

    // Type filtering
    if (activityType !== "all") {
      typeMatch = activity.type.toLowerCase() === activityType.toLowerCase();
    }

    return dateMatch && typeMatch;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Export Professional Reports
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-700">Filter Options</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type
                </label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="meetings">Meetings</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="supervision">Supervision</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              <div className="flex items-end">
                <div className="bg-white p-3 rounded border w-full">
                  <p className="text-sm text-gray-600">Activities to Export</p>
                  <p className="text-2xl font-bold text-green-600">{filteredActivities.length}</p>
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Export Options */}
          <ExportTabs
            activities={filteredActivities}
            dateRange={dateRange}
            startDate={startDate}
            endDate={endDate}
            activityType={activityType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportsExportDialog;
