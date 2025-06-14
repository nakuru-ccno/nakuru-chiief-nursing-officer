
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore: Used for Excel export
import * as XLSX from "xlsx";

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

export default function Reports() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load activities from Supabase on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching activities for reports:', error);
        toast({
          title: "Error",
          description: "Failed to load activities for reports",
          variant: "destructive",
        });
        return;
      }

      setActivities(data || []);
      console.log('Loaded activities from Supabase for reports:', data);
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

  const handleExportExcel = () => {
    if (activities.length === 0) {
      toast({
        title: "No Data",
        description: "No activities to export",
        variant: "destructive",
      });
      return;
    }

    const ws = XLSX.utils.json_to_sheet(activities);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activities");
    XLSX.writeFile(wb, "nakuru-count-activities.xlsx");
    
    toast({
      title: "Success",
      description: "Activities exported to Excel successfully",
    });
  };

  const handleExportPDF = () => {
    // Browser-native PDF demo: print dialog
    window.print();
    // For production, use jsPDF or pdf-lib to create pro pdfs
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-8 text-gray-500">
            <p>Loading activities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4 text-[#be2251]">Reports</h2>
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleExportExcel}
            className="bg-[#fd3572] text-white font-bold px-4 py-2 rounded shadow hover:bg-[#be2251] transition"
          >
            Export to Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-black text-white font-bold px-4 py-2 rounded shadow hover:bg-[#323232] transition"
          >
            Export to PDF
          </button>
        </div>
        
        {activities.length > 0 ? (
          <table className="w-full table-auto border mb-8 print:bg-transparent">
            <thead>
              <tr className="bg-[#fd3572] text-white text-sm">
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Facility</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Duration</th>
                <th className="px-2 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} className="even:bg-gray-50 text-sm">
                  <td className="border px-2 py-2">{a.date}</td>
                  <td className="border px-2 py-2">{a.facility}</td>
                  <td className="border px-2 py-2">{a.title}</td>
                  <td className="border px-2 py-2">{a.type}</td>
                  <td className="border px-2 py-2">{a.duration}</td>
                  <td className="border px-2 py-2">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No activities found to display in reports.</p>
          </div>
        )}
        
        <div className="text-sm italic text-gray-500">
          All submitted activities are visible here. Export for official reporting.
        </div>
      </div>
    </div>
  );
}
