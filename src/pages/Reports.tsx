
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
// @ts-ignore: Used for Excel export
import * as XLSX from "xlsx";

function getInitialActivities() {
  // For demo only, real data should come from backend
  return [
    {
      id: 1,
      date: "2025-06-08",
      facility: "Nakuru Referral",
      title: "Quarterly Admin Meeting",
      type: "Meetings",
      duration: 90,
      description: "Discussed annual budget.",
      submittedBy: "Demo User",
      submittedAt: "2025-06-08T10:00:00Z"
    },
    {
      id: 2,
      date: "2025-06-09",
      facility: "Kabarak Subcounty",
      title: "Training session",
      type: "Training",
      duration: 60,
      description: "Updated on protocols.",
      submittedBy: "Demo User",
      submittedAt: "2025-06-09T14:30:00Z"
    },
  ];
}

export default function Reports() {
  const [activities, setActivities] = useState(getInitialActivities());

  // Load activities from localStorage on component mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('userActivities');
    if (savedActivities) {
      try {
        const parsedActivities = JSON.parse(savedActivities);
        setActivities(parsedActivities);
        console.log('Loaded activities from localStorage for reports:', parsedActivities);
      } catch (error) {
        console.error('Error parsing saved activities:', error);
        // If there's an error, fall back to initial activities
        setActivities(getInitialActivities());
      }
    }
  }, []);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(activities);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activities");
    XLSX.writeFile(wb, "nakuru-count-activities.xlsx");
  };

  const handleExportPDF = () => {
    // Browser-native PDF demo: print dialog
    window.print();
    // For production, use jsPDF or pdf-lib to create pro pdfs
  };

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
            {activities.map((a, i) => (
              <tr key={a.id || i} className="even:bg-gray-50 text-sm">
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
        <div className="text-sm italic text-gray-500">
          All submitted activities are visible here. Export for official reporting.
        </div>
      </div>
    </div>
  );
}
