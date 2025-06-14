import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";

interface ReportFiltersProps {
  dateRange: string;
  setDateRange: (range: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  activityType: string;
  setActivityType: (type: string) => void;
  onApplyFilters: () => void;
  totalRecords: number;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  dateRange,
  setDateRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  activityType,
  setActivityType,
  onApplyFilters,
  totalRecords
}) => {
  const handleQuickDateRange = (range: string) => {
    setDateRange(range);
    const today = new Date();
    
    switch (range) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        setStartDate(weekStart);
        setEndDate(today);
        break;
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(1);
        setStartDate(monthStart);
        setEndDate(today);
        break;
      case 'custom':
        // Keep existing dates
        break;
      default:
        setStartDate(undefined);
        setEndDate(undefined);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Filter size={20} />
          Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range Quick Select */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
            <Select value={dateRange} onValueChange={handleQuickDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP") : "Select date"}
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

          {/* End Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PP") : "Select date"}
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

          {/* Activity Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Activity Type</label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
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
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalRecords}</span> records match your filters
          </div>
          <Button onClick={onApplyFilters} className="bg-[#fd3572] hover:bg-[#be2251]">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportFilters;
