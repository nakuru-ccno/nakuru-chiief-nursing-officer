
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, File, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore: Used for Excel export
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

  const exportToExcel = () => {
    if (activities.length === 0) {
      toast({
        title: "No Data",
        description: "No activities to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = activities.map(activity => ({
      "Date": new Date(activity.created_at).toLocaleDateString(),
      "Title": activity.title,
      "Type": activity.type,
      "Facility": activity.facility,
      "Duration (min)": activity.duration,
      "Description": activity.description,
      "Submitted By": activity.submitted_by,
      "Submitted Date": new Date(activity.submitted_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activities");
    
    const filename = `${getReportTitle().replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    toast({
      title: "Excel Export Complete",
      description: `Report exported as ${filename}`,
    });
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

    // Create a new window with the report content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${getReportTitle()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #fd3572; padding-bottom: 20px; }
            .title { color: #be2251; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: #666; font-size: 14px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 20px; background: #f8f9fa; }
            .stat { text-align: center; }
            .stat-value { font-size: 20px; font-weight: bold; color: #fd3572; }
            .stat-label { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #fd3572; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${getReportTitle()}</div>
            <div class="subtitle">County of Unlimited Opportunities - Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${activities.length}</div>
              <div class="stat-label">Total Activities</div>
            </div>
            <div class="stat">
              <div class="stat-value">${Math.floor(activities.reduce((sum, a) => sum + (a.duration || 0), 0) / 60)}</div>
              <div class="stat-label">Total Hours</div>
            </div>
            <div class="stat">
              <div class="stat-value">${new Set(activities.map(a => a.submitted_by)).size}</div>
              <div class="stat-label">Contributors</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th>Facility</th>
                <th>Duration</th>
                <th>Submitted By</th>
              </tr>
            </thead>
            <tbody>
              ${activities.map(activity => `
                <tr>
                  <td>${new Date(activity.created_at).toLocaleDateString()}</td>
                  <td>${activity.title}</td>
                  <td>${activity.type}</td>
                  <td>${activity.facility}</td>
                  <td>${activity.duration} min</td>
                  <td>${activity.submitted_by}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report was generated automatically from the County Activities Management System.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
      toast({
        title: "PDF Export Ready",
        description: "Print dialog opened. Choose 'Save as PDF' to download.",
      });
    }, 500);
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

    const wordContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${getReportTitle()}</title>
          <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:TrackMoves>false</w:TrackMoves><w:TrackFormatting>false</w:TrackFormatting><w:ValidateAgainstSchemas>false</w:ValidateAgainstSchemas><w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid><w:IgnoreMixedContent>false</w:IgnoreMixedContent><w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText></w:WordDocument></xml><![endif]-->
          <style>
            body { font-family: 'Times New Roman', serif; margin: 1in; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #fd3572; padding-bottom: 20px; }
            .title { color: #be2251; font-size: 20pt; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: #666; font-size: 12pt; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 10pt; }
            th { background-color: #fd3572; color: white; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${getReportTitle()}</div>
            <div class="subtitle">County of Unlimited Opportunities<br>Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          <p><strong>Report Summary:</strong></p>
          <ul>
            <li>Total Activities: ${activities.length}</li>
            <li>Total Hours: ${Math.floor(activities.reduce((sum, a) => sum + (a.duration || 0), 0) / 60)}</li>
            <li>Contributors: ${new Set(activities.map(a => a.submitted_by)).size}</li>
            <li>Date Range: ${startDate && endDate ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : 'All Time'}</li>
          </ul>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th>Facility</th>
                <th>Duration (min)</th>
                <th>Description</th>
                <th>Submitted By</th>
              </tr>
            </thead>
            <tbody>
              ${activities.map(activity => `
                <tr>
                  <td>${new Date(activity.created_at).toLocaleDateString()}</td>
                  <td>${activity.title}</td>
                  <td>${activity.type}</td>
                  <td>${activity.facility}</td>
                  <td>${activity.duration}</td>
                  <td>${activity.description}</td>
                  <td>${activity.submitted_by}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getReportTitle().replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Word Export Complete",
      description: "Report downloaded as Word document",
    });
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
              <h3 className="text-lg font-semibold mb-2">Excel Spreadsheet Export</h3>
              <p className="text-gray-600 mb-4">
                Export your filtered activities to a professional Excel spreadsheet with formatted columns and data analysis capabilities.
              </p>
              <Button 
                onClick={exportToExcel}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate Excel Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4">
            <div className="text-center p-6">
              <FileText size={48} className="mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold mb-2">PDF Document Export</h3>
              <p className="text-gray-600 mb-4">
                Generate a professional PDF report with summary statistics, formatted tables, and official branding for presentations and archival.
              </p>
              <Button 
                onClick={exportToPDF}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate PDF Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="word" className="space-y-4">
            <div className="text-center p-6">
              <File size={48} className="mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Word Document Export</h3>
              <p className="text-gray-600 mb-4">
                Create a professional Word document with formatted tables, summary statistics, and editable content for reports and documentation.
              </p>
              <Button 
                onClick={exportToWord}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate Word Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExportTabs;
