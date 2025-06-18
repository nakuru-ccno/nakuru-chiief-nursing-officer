
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

  const getReportMetrics = () => {
    const totalHours = Math.floor(activities.reduce((sum, a) => sum + (a.duration || 0), 0) / 60);
    const totalMinutes = activities.reduce((sum, a) => sum + (a.duration || 0), 0) % 60;
    const contributors = new Set(activities.map(a => a.submitted_by)).size;
    const facilities = new Set(activities.map(a => a.facility)).size;
    const activityTypes = new Set(activities.map(a => a.type)).size;
    
    return {
      totalActivities: activities.length,
      totalHours,
      totalMinutes,
      contributors,
      facilities,
      activityTypes,
      avgDuration: activities.length > 0 ? Math.round(activities.reduce((sum, a) => sum + (a.duration || 0), 0) / activities.length) : 0
    };
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
      console.log('📊 Starting professional Excel export...');
      const metrics = getReportMetrics();
      
      // Create summary sheet data
      const summaryData = [
        ["NAKURU COUNTY", "", "", ""],
        ["County of Unlimited Opportunities", "", "", ""],
        ["", "", "", ""],
        [getReportTitle(), "", "", ""],
        [`Generated on: ${new Date().toLocaleDateString()}`, "", "", ""],
        ["", "", "", ""],
        ["EXECUTIVE SUMMARY", "", "", ""],
        ["Total Activities", metrics.totalActivities, "", ""],
        ["Total Duration", `${metrics.totalHours}h ${metrics.totalMinutes}m`, "", ""],
        ["Average Duration", `${metrics.avgDuration} minutes`, "", ""],
        ["Contributors", metrics.contributors, "", ""],
        ["Facilities Involved", metrics.facilities, "", ""],
        ["Activity Types", metrics.activityTypes, "", ""],
        ["", "", "", ""],
      ];

      // Create detailed activities data
      const activitiesData = [
        ["DETAILED ACTIVITY LOG", "", "", "", "", "", "", ""],
        ["Date", "Title", "Type", "Facility", "Duration (min)", "Description", "Submitted By", "Submission Date"],
        ...activities.map(activity => [
          new Date(activity.created_at).toLocaleDateString(),
          activity.title,
          activity.type,
          activity.facility,
          activity.duration,
          activity.description,
          activity.submitted_by,
          new Date(activity.submitted_at).toLocaleDateString()
        ])
      ];

      // Create workbook and worksheets
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Executive Summary");
      
      // Activities sheet
      const activitiesWs = XLSX.utils.aoa_to_sheet(activitiesData);
      XLSX.utils.book_append_sheet(wb, activitiesWs, "Detailed Activities");
      
      const filename = `Nakuru_County_${getReportTitle().replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      
      console.log('✅ Professional Excel export completed');
      toast({
        title: "Excel Export Complete",
        description: `Professional report exported as ${filename}`,
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
      console.log('📄 Starting professional PDF export...');
      const metrics = getReportMetrics();
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "PDF Export Error",
          description: "Could not open print window. Please check your browser settings.",
          variant: "destructive",
        });
        return;
      }

      const reportHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${getReportTitle()} - Nakuru County</title>
            <style>
              @page {
                margin: 0.75in;
                @top-center {
                  content: "Nakuru County - ${getReportTitle()}";
                  font-size: 10pt;
                  color: #666;
                }
                @bottom-center {
                  content: "Page " counter(page) " of " counter(pages);
                  font-size: 10pt;
                  color: #666;
                }
              }
              body { 
                font-family: 'Times New Roman', serif; 
                margin: 0; 
                padding: 0;
                line-height: 1.4;
                color: #333;
              }
              .letterhead {
                text-align: center;
                border-bottom: 3px solid #fd3572;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .logo-section {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 15px;
              }
              .logo {
                width: 80px;
                height: 80px;
                margin-right: 20px;
                border-radius: 8px;
              }
              .county-name {
                font-size: 28pt;
                font-weight: bold;
                color: #fd3572;
                margin: 0;
                letter-spacing: 2px;
              }
              .county-tagline {
                font-size: 14pt;
                color: #be2251;
                margin: 5px 0 0 0;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .report-header {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-left: 5px solid #fd3572;
              }
              .report-title {
                font-size: 20pt;
                font-weight: bold;
                color: #be2251;
                margin-bottom: 10px;
              }
              .report-date {
                font-size: 12pt;
                color: #666;
              }
              .executive-summary {
                margin: 30px 0;
                page-break-inside: avoid;
              }
              .section-title {
                font-size: 16pt;
                font-weight: bold;
                color: #be2251;
                border-bottom: 2px solid #fd3572;
                padding-bottom: 5px;
                margin-bottom: 15px;
              }
              .metrics-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin: 20px 0;
              }
              .metric-card {
                text-align: center;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background: #fff;
              }
              .metric-value {
                font-size: 24pt;
                font-weight: bold;
                color: #fd3572;
                display: block;
              }
              .metric-label {
                font-size: 10pt;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .activities-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 30px;
                font-size: 9pt;
              }
              .activities-table th,
              .activities-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                vertical-align: top;
              }
              .activities-table th {
                background-color: #fd3572;
                color: white;
                font-weight: bold;
                text-align: center;
              }
              .activities-table tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .activities-table tr:hover {
                background-color: #f5f5f5;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 10pt;
                color: #666;
                page-break-inside: avoid;
              }
              .signature-section {
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
              }
              .signature-block {
                text-align: center;
                width: 200px;
              }
              .signature-line {
                border-top: 1px solid #333;
                margin-top: 40px;
                padding-top: 5px;
                font-size: 10pt;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="letterhead">
              <div class="logo-section">
                <img src="/lovable-uploads/00cc8120-039e-4419-8b2b-e07e69d6fdd8.png" alt="Nakuru County Logo" class="logo">
                <div>
                  <h1 class="county-name">NAKURU COUNTY</h1>
                  <p class="county-tagline">County of Unlimited Opportunities</p>
                </div>
              </div>
            </div>
            
            <div class="report-header">
              <div class="report-title">${getReportTitle()}</div>
              <div class="report-date">Generated on ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
            </div>

            <div class="executive-summary">
              <h2 class="section-title">Executive Summary</h2>
              <div class="metrics-grid">
                <div class="metric-card">
                  <span class="metric-value">${metrics.totalActivities}</span>
                  <div class="metric-label">Total Activities</div>
                </div>
                <div class="metric-card">
                  <span class="metric-value">${metrics.totalHours}h ${metrics.totalMinutes}m</span>
                  <div class="metric-label">Total Duration</div>
                </div>
                <div class="metric-card">
                  <span class="metric-value">${metrics.contributors}</span>
                  <div class="metric-label">Contributors</div>
                </div>
                <div class="metric-card">
                  <span class="metric-value">${metrics.avgDuration} min</span>
                  <div class="metric-label">Average Duration</div>
                </div>
                <div class="metric-card">
                  <span class="metric-value">${metrics.facilities}</span>
                  <div class="metric-label">Facilities</div>
                </div>
                <div class="metric-card">
                  <span class="metric-value">${metrics.activityTypes}</span>
                  <div class="metric-label">Activity Types</div>
                </div>
              </div>
            </div>

            <div style="page-break-before: always;">
              <h2 class="section-title">Detailed Activity Log</h2>
              <table class="activities-table">
                <thead>
                  <tr>
                    <th style="width: 12%;">Date</th>
                    <th style="width: 20%;">Title</th>
                    <th style="width: 12%;">Type</th>
                    <th style="width: 12%;">Facility</th>
                    <th style="width: 8%;">Duration</th>
                    <th style="width: 25%;">Description</th>
                    <th style="width: 11%;">Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  ${activities.map(activity => `
                    <tr>
                      <td>${new Date(activity.created_at).toLocaleDateString()}</td>
                      <td><strong>${activity.title}</strong></td>
                      <td>${activity.type}</td>
                      <td>${activity.facility}</td>
                      <td>${activity.duration} min</td>
                      <td>${activity.description}</td>
                      <td>${activity.submitted_by}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="footer">
              <div class="signature-section">
                <div class="signature-block">
                  <div class="signature-line">Prepared By</div>
                </div>
                <div class="signature-block">
                  <div class="signature-line">Reviewed By</div>
                </div>
                <div class="signature-block">
                  <div class="signature-line">Approved By</div>
                </div>
              </div>
              <p style="margin-top: 30px;">
                This report was generated automatically from the Nakuru County Activities Management System.<br>
                For inquiries, please contact the County Administration Office.
              </p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(reportHtml);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        console.log('✅ Professional PDF export completed');
        toast({
          title: "PDF Export Ready",
          description: "Professional report ready. Choose 'Save as PDF' to download.",
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
      console.log('📝 Starting professional Word export...');
      const metrics = getReportMetrics();
      const wordContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8">
            <title>${getReportTitle()} - Nakuru County</title>
            <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:TrackMoves>false</w:TrackMoves><w:TrackFormatting>false</w:TrackFormatting><w:ValidateAgainstSchemas>false</w:ValidateAgainstSchemas><w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid><w:IgnoreMixedContent>false</w:IgnoreMixedContent><w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText></w:WordDocument></xml><![endif]-->
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
                letter-spacing: 2pt;
              }
              .county-tagline {
                font-size: 12pt;
                color: #be2251;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1pt;
              }
              .report-title {
                font-size: 18pt;
                font-weight: bold;
                color: #be2251;
                text-align: center;
                margin: 30pt 0 20pt 0;
                text-transform: uppercase;
              }
              .report-date {
                text-align: center;
                font-size: 11pt;
                color: #666;
                margin-bottom: 30pt;
              }
              .section-title {
                font-size: 14pt;
                font-weight: bold;
                color: #be2251;
                border-bottom: 2pt solid #fd3572;
                padding-bottom: 3pt;
                margin: 20pt 0 10pt 0;
              }
              .metrics-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15pt 0;
              }
              .metrics-table td {
                border: 1pt solid #ddd;
                padding: 8pt;
                font-size: 11pt;
              }
              .metrics-table .metric-label {
                font-weight: bold;
                background-color: #f8f9fa;
                width: 40%;
              }
              .activities-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20pt;
                font-size: 9pt;
              }
              .activities-table th,
              .activities-table td {
                border: 1pt solid #000;
                padding: 6pt;
              }
              .activities-table th {
                background-color: #fd3572;
                color: white;
                font-weight: bold;
                text-align: center;
              }
              .footer {
                margin-top: 40pt;
                padding-top: 20pt;
                border-top: 1pt solid #ddd;
                font-size: 9pt;
                color: #666;
                text-align: center;
              }
              .signature-section {
                margin-top: 40pt;
              }
              .signature-line {
                display: inline-block;
                width: 200pt;
                border-bottom: 1pt solid #000;
                margin: 0 20pt;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="letterhead">
              <div class="county-name">NAKURU COUNTY</div>
              <div class="county-tagline">County of Unlimited Opportunities</div>
            </div>
            
            <div class="report-title">${getReportTitle()}</div>
            <div class="report-date">Generated on ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>

            <div class="section-title">Executive Summary</div>
            <table class="metrics-table">
              <tr>
                <td class="metric-label">Total Activities</td>
                <td>${metrics.totalActivities}</td>
                <td class="metric-label">Total Duration</td>
                <td>${metrics.totalHours}h ${metrics.totalMinutes}m</td>
              </tr>
              <tr>
                <td class="metric-label">Average Duration</td>
                <td>${metrics.avgDuration} minutes</td>
                <td class="metric-label">Contributors</td>
                <td>${metrics.contributors}</td>
              </tr>
              <tr>
                <td class="metric-label">Facilities Involved</td>
                <td>${metrics.facilities}</td>
                <td class="metric-label">Activity Types</td>
                <td>${metrics.activityTypes}</td>
              </tr>
              <tr>
                <td class="metric-label">Report Period</td>
                <td colspan="3">${startDate && endDate ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : 'All Time'}</td>
              </tr>
            </table>

            <div style="page-break-before: always;">
              <div class="section-title">Detailed Activity Log</div>
              <table class="activities-table">
                <thead>
                  <tr>
                    <th style="width: 12%;">Date</th>
                    <th style="width: 18%;">Title</th>
                    <th style="width: 12%;">Type</th>
                    <th style="width: 10%;">Facility</th>
                    <th style="width: 8%;">Duration</th>
                    <th style="width: 25%;">Description</th>
                    <th style="width: 15%;">Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  ${activities.map(activity => `
                    <tr>
                      <td>${new Date(activity.created_at).toLocaleDateString()}</td>
                      <td><strong>${activity.title}</strong></td>
                      <td>${activity.type}</td>
                      <td>${activity.facility}</td>
                      <td>${activity.duration} min</td>
                      <td>${activity.description}</td>
                      <td>${activity.submitted_by}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="footer">
              <div class="signature-section">
                <p>
                  Prepared By: <span class="signature-line">&nbsp;</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  Reviewed By: <span class="signature-line">&nbsp;</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  Approved By: <span class="signature-line">&nbsp;</span>
                </p>
              </div>
              <p style="margin-top: 30pt;">
                This report was generated automatically from the Nakuru County Activities Management System.<br>
                For inquiries, please contact the County Administration Office.
              </p>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([wordContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nakuru_County_${getReportTitle().replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ Professional Word export completed');
      toast({
        title: "Word Export Complete",
        description: "Professional report downloaded as Word document",
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
              <h3 className="text-lg font-semibold mb-2">Professional Excel Report</h3>
              <p className="text-gray-600 mb-4">
                Export to Excel with county branding, executive summary, and detailed activity sheets with professional formatting and analysis capabilities.
              </p>
              <Button 
                onClick={exportToExcel}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate Professional Excel Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-4">
            <div className="text-center p-6">
              <FileText size={48} className="mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-semibold mb-2">Professional PDF Report</h3>
              <p className="text-gray-600 mb-4">
                Generate a professional PDF with county letterhead, executive summary, detailed metrics, and signature sections for official documentation.
              </p>
              <Button 
                onClick={exportToPDF}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate Professional PDF Report
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="word" className="space-y-4">
            <div className="text-center p-6">
              <File size={48} className="mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Professional Word Document</h3>
              <p className="text-gray-600 mb-4">
                Create a professional Word document with county branding, formatted tables, executive summary, and editable content for official reports.
              </p>
              <Button 
                onClick={exportToWord}
                className="bg-[#fd3572] hover:bg-[#be2251] flex items-center gap-2"
                disabled={activities.length === 0}
              >
                <Download size={16} />
                Generate Professional Word Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExportTabs;
