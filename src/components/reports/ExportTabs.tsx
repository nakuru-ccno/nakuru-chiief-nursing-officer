
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, File, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

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

interface ExportTabsProps {
  activities: Activity[];
  dateRange: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  activityType: string;
}

const ExportTabs: React.FC<ExportTabsProps> = ({
  activities,
  dateRange,
  startDate,
  endDate,
  activityType
}) => {
  const { toast } = useToast();

  const getReportTitle = () => {
    let title = "Activity Report";
    if (activityType !== "all") {
      title += ` - ${activityType.charAt(0).toUpperCase() + activityType.slice(1)}`;
    }
    if (startDate && endDate) {
      title += ` (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
    } else if (dateRange !== "all") {
      title += ` - ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`;
    }
    return title;
  };

  const groupActivitiesByType = () => {
    const grouped: { [key: string]: Activity[] } = {};
    activities.forEach(activity => {
      const type = activity.type || 'General';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(activity);
    });
    return grouped;
  };

  const formatActivityForExport = (activity: Activity) => {
    const activityDate = new Date(activity.created_at).toLocaleDateString();
    return `${activity.title}
${activity.type} Date: ${activityDate} Duration: ${activity.duration || 0} minutes
${activity.description ? activity.description : ''}
Facility: ${activity.facility || 'HQ'}`;
  };

  const exportToExcel = () => {
    if (activities.length === 0) {
      toast({
        title: "No Data",
        description: "No activities to export",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📊 Starting formatted Excel export...');
      const groupedActivities = groupActivitiesByType();
      
      // Create formatted export data
      const exportData: string[][] = [
        ["NAKURU COUNTY - ACTIVITY REPORT"],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [""],
      ];

      // Add grouped activities
      Object.entries(groupedActivities).forEach(([type, typeActivities]) => {
        exportData.push([type.toUpperCase()]);
        typeActivities.forEach(activity => {
          const activityDate = new Date(activity.created_at).toLocaleDateString();
          exportData.push([`${activity.title}`]);
          exportData.push([`${activity.type} Date: ${activityDate} Duration: ${activity.duration || 0} minutes`]);
          if (activity.description) {
            exportData.push([activity.description]);
          }
          exportData.push([`Facility: ${activity.facility || 'HQ'}`]);
          exportData.push([""]);
        });
        exportData.push([""]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Activities");
      
      const filename = `Nakuru_County_Activities_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      console.log('✅ Formatted Excel export completed');
      toast({
        title: "Excel Export Complete",
        description: `Report exported as ${filename}`,
      });
    } catch (error) {
      console.error('❌ Excel export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to export Excel file",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    if (activities.length === 0) {
      toast({
        title: "No Data",
        description: "No activities to export",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📄 Starting formatted PDF export...');
      const groupedActivities = groupActivitiesByType();
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        toast({
          title: "PDF Export Error",
          description: "Could not open print window. Please check your browser settings.",
          variant: "destructive",
        });
        return;
      }

      let activitiesHtml = '';
      Object.entries(groupedActivities).forEach(([type, typeActivities]) => {
        activitiesHtml += `<div class="activity-section">
          <h2 class="activity-type">${type.toUpperCase()}</h2>`;
        
        typeActivities.forEach(activity => {
          const activityDate = new Date(activity.created_at).toLocaleDateString();
          activitiesHtml += `
            <div class="activity-item">
              <h3 class="activity-title">${activity.title}</h3>
              <p class="activity-meta">${activity.type} Date: ${activityDate} Duration: ${activity.duration || 0} minutes</p>
              ${activity.description ? `<p class="activity-description">${activity.description}</p>` : ''}
              <p class="activity-facility">Facility: ${activity.facility || 'HQ'}</p>
            </div>`;
        });
        
        activitiesHtml += '</div>';
      });

      const reportHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Nakuru County - Activity Report</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                margin: 1in; 
                line-height: 1.4;
                color: #333;
              }
              .letterhead {
                text-align: center;
                border-bottom: 3px solid #fd3572;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .county-name {
                font-size: 24pt;
                font-weight: bold;
                color: #fd3572;
                margin-bottom: 5px;
              }
              .report-date {
                text-align: center;
                font-size: 11pt;
                color: #666;
                margin-bottom: 30px;
              }
              .activity-section {
                margin-bottom: 30px;
                page-break-inside: avoid;
              }
              .activity-type {
                font-size: 16pt;
                font-weight: bold;
                color: #be2251;
                border-bottom: 2px solid #fd3572;
                padding-bottom: 5px;
                margin-bottom: 15px;
              }
              .activity-item {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-left: 4px solid #fd3572;
              }
              .activity-title {
                font-size: 14pt;
                font-weight: bold;
                color: #333;
                margin-bottom: 8px;
              }
              .activity-meta {
                font-size: 11pt;
                color: #666;
                margin-bottom: 8px;
                font-weight: 600;
              }
              .activity-description {
                font-size: 11pt;
                color: #555;
                margin-bottom: 8px;
                line-height: 1.5;
              }
              .activity-facility {
                font-size: 10pt;
                color: #666;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <div class="letterhead">
              <div class="county-name">NAKURU COUNTY</div>
              <div style="font-size: 12pt; color: #be2251;">County of Unlimited Opportunities</div>
            </div>
            
            <div class="report-date">Generated on ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>

            ${activitiesHtml}
          </body>
        </html>
      `;

      printWindow.document.write(reportHtml);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        console.log('✅ Formatted PDF export completed');
        toast({
          title: "PDF Export Ready",
          description: "Formatted report ready. Choose 'Save as PDF' to download.",
        });
      }, 1000);
    } catch (error) {
      console.error('❌ PDF export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to export PDF file",
        variant: "destructive",
      });
    }
  };

  const exportToWord = () => {
    if (activities.length === 0) {
      toast({
        title: "No Data",
        description: "No activities to export",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📝 Starting formatted Word export...');
      const groupedActivities = groupActivitiesByType();
      
      let activitiesContent = '';
      Object.entries(groupedActivities).forEach(([type, typeActivities]) => {
        activitiesContent += `<div style="margin-bottom: 30pt;">
          <div style="font-size: 14pt; font-weight: bold; color: #be2251; border-bottom: 2pt solid #fd3572; padding-bottom: 3pt; margin-bottom: 10pt;">${type.toUpperCase()}</div>`;
        
        typeActivities.forEach(activity => {
          const activityDate = new Date(activity.created_at).toLocaleDateString();
          activitiesContent += `
            <div style="margin-bottom: 15pt; padding: 10pt; background-color: #f8f9fa; border-left: 3pt solid #fd3572;">
              <div style="font-size: 12pt; font-weight: bold; margin-bottom: 5pt;">${activity.title}</div>
              <div style="font-size: 10pt; color: #666; margin-bottom: 5pt; font-weight: 600;">${activity.type} Date: ${activityDate} Duration: ${activity.duration || 0} minutes</div>
              ${activity.description ? `<div style="font-size: 10pt; color: #555; margin-bottom: 5pt;">${activity.description}</div>` : ''}
              <div style="font-size: 9pt; color: #666; font-style: italic;">Facility: ${activity.facility || 'HQ'}</div>
            </div>`;
        });
        
        activitiesContent += '</div>';
      });

      const wordContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
            <title>Nakuru County - Activity Report</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                margin: 1in; 
                line-height: 1.5;
              }
              .letterhead {
                text-align: center;
                border-bottom: 3pt solid #fd3572;
                padding-bottom: 20pt;
                margin-bottom: 30pt;
              }
              .county-name {
                font-size: 24pt;
                font-weight: bold;
                color: #fd3572;
                margin-bottom: 5pt;
              }
            </style>
          </head>
          <body>
            <div class="letterhead">
              <div class="county-name">NAKURU COUNTY</div>
              <div style="font-size: 12pt; color: #be2251;">County of Unlimited Opportunities</div>
            </div>
            
            <div style="text-align: center; font-size: 11pt; color: #666; margin-bottom: 30pt;">Generated on ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>

            ${activitiesContent}
          </body>
        </html>
      `;

      const blob = new Blob([wordContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nakuru_County_Activities_${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ Formatted Word export completed');
      toast({
        title: "Word Export Complete",
        description: "Formatted report downloaded as Word document",
      });
    } catch (error) {
      console.error('❌ Word export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to export Word file",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-700">Professional Export Options</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="excel" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="excel" className="flex items-center gap-2">
              <FileSpreadsheet size={16} />
              Excel
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText size={16} />
              PDF
            </TabsTrigger>
            <TabsTrigger value="word" className="flex items-center gap-2">
              <File size={16} />
              Word
            </TabsTrigger>
          </TabsList>

          <TabsContent value="excel" className="space-y-4">
            <div className="text-center p-6">
              <FileSpreadsheet size={48} className="mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Formatted Excel Report</h3>
              <p className="text-gray-600 mb-4">
                Export activities grouped by type with county branding and organized formatting as requested.
              </p>
              <Button 
                onClick={exportToExcel}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate Formatted Excel Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4">
            <div className="text-center p-6">
              <FileText size={48} className="mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold mb-2">Formatted PDF Report</h3>
              <p className="text-gray-600 mb-4">
                Generate a formatted PDF with activities organized by type, highlighted sections, and county branding.
              </p>
              <Button 
                onClick={exportToPDF}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate Formatted PDF Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="word" className="space-y-4">
            <div className="text-center p-6">
              <File size={48} className="mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Formatted Word Document</h3>
              <p className="text-gray-600 mb-4">
                Create a formatted Word document with organized sections, highlighting, and professional layout.
              </p>
              <Button 
                onClick={exportToWord}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate Formatted Word Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExportTabs;
