import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: string[][];
      body?: (string | number)[][];
      startY?: number;
      margin?: { top?: number; right?: number; bottom?: number; left?: number };
      theme?: 'striped' | 'grid' | 'plain';
      headStyles?: Record<string, unknown>;
      bodyStyles?: Record<string, unknown>;
      alternateRowStyles?: Record<string, unknown>;
      columnStyles?: Record<string, Record<string, unknown>>;
    }) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface ExportOptions {
  title?: string;
  symbol?: string;
  timeframe?: string;
  includeStats?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  quality?: number;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface CalendarStats {
  totalDays: number;
  gainDays: number;
  lossDays: number;
  totalGains: number;
  totalLosses: number;
  netChange: number;
  avgChange: number;
  maxGain: number;
  maxLoss: number;
  avgVolume: number;
  volatility: number;
  winRate: number;
}

export class PDFExporter {
  private defaultOptions: ExportOptions = {
    title: 'Market Seasonality Calendar',
    symbol: 'BTCUSDT',
    timeframe: '1M',
    includeStats: true,
    pageOrientation: 'landscape',
    quality: 1.0,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  };

 


  /**
   * Export calendar data as tabular PDF using AutoTable for better formatting
   */
  async exportEnhancedDataPDF(
    data: Array<{ time: string; change: number; volume?: number }>,
    options: Partial<ExportOptions> = {},
    stats?: CalendarStats
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 30;

    // Add header
    this.addHeader(pdf, mergedOptions, pageWidth);

    // Prepare table data
    const tableData = data.map(item => [
      format(new Date(item.time), 'MMM dd, yyyy'),
      `${item.change > 0 ? '+' : ''}${item.change.toFixed(2)}%`,
      item.volume ? item.volume.toLocaleString() : 'N/A',
      item.change > 0 ? 'Gain' : item.change < 0 ? 'Loss' : 'Neutral'
    ]);

    // Create enhanced table with AutoTable
    autoTable(pdf, {
      head: [['Date', 'Change (%)', 'Volume', 'Type']],
      body: tableData,
      startY: yPosition,
      margin: { top: 20, right: 15, bottom: 20, left: 15 },
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Date column
        1: { cellWidth: 30, halign: 'right' }, // Change column
        2: { cellWidth: 40, halign: 'right' }, // Volume column
        3: { cellWidth: 25, halign: 'center' } // Type column
      }
    });

    // Add statistics summary if provided
    if (stats) {
      const finalY = (pdf).lastAutoTable?.finalY || 100;
      
      // Add some spacing
      if (finalY > 200) {
        pdf.addPage();
        yPosition = 30;
      } else {
        yPosition = finalY + 20;
      }

      // Statistics title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Summary', 15, yPosition);
      yPosition += 15;

      // Create statistics table
      const statsData = [
        ['Total Trading Days', stats.totalDays.toString()],
        ['Gain Days', `${stats.gainDays} (${((stats.gainDays / stats.totalDays) * 100).toFixed(1)}%)`],
        ['Loss Days', `${stats.lossDays} (${((stats.lossDays / stats.totalDays) * 100).toFixed(1)}%)`],
        ['Win Rate', `${stats.winRate.toFixed(1)}%`],
        ['Average Change', `${stats.avgChange.toFixed(2)}%`],
        ['Best Day', `+${stats.maxGain.toFixed(2)}%`],
        ['Worst Day', `${stats.maxLoss.toFixed(2)}%`],
        ['Volatility', `${stats.volatility.toFixed(2)}%`],
        ['Net Performance', `${stats.netChange.toFixed(2)}%`]
      ];

      autoTable(pdf, {
        body: statsData,
        startY: yPosition,
        margin: { top: 20, right: 15, bottom: 20, left: 15 },
        theme: 'plain',
        bodyStyles: {
          fontSize: 10,
          cellPadding: 4
        },
        columnStyles: {
          0: { 
            cellWidth: 60, 
            fontStyle: 'bold',
            textColor: [51, 65, 85] // Slate color
          },
          1: { 
            cellWidth: 60, 
            halign: 'right',
            textColor: [15, 23, 42] // Dark slate
          }
        }
      });
    }

    // Add footer
    this.addFooter(pdf);

    // Download
    const fileName = `${mergedOptions.symbol}_enhanced_data_${mergedOptions.timeframe}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Export calendar data as tabular PDF (original method)
   */
  async exportCalendarData(
    data: Array<{ time: string; change: number; volume?: number }>,
    options: Partial<ExportOptions> = {},
    stats?: CalendarStats
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin + 20;

    // Add header
    this.addHeader(pdf, mergedOptions, pageWidth);
    yPosition += 20;

    // Add data table
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    // Table headers
    const headers = ['Date', 'Change (%)', 'Volume'];
    const colWidths = [60, 40, 40];
    let xPosition = margin;

    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });

    yPosition += 10;
    pdf.setFont('helvetica', 'normal');

    // Table data
    data.forEach((item) => {
      if (yPosition > 270) { // New page needed
        pdf.addPage();
        yPosition = margin;
      }

      xPosition = margin;
      const rowData = [
        format(new Date(item.time), 'yyyy-MM-dd'),
        item.change.toFixed(2),
        item.volume ? item.volume.toLocaleString() : 'N/A'
      ];

      rowData.forEach((cell, cellIndex) => {
        pdf.text(cell, xPosition, yPosition);
        xPosition += colWidths[cellIndex];
      });

      yPosition += 7;
    });

    // Add statistics summary
    if (stats) {
      pdf.addPage();
      this.addStatsPage(pdf, stats);
    }

    // Download
    const fileName = `${mergedOptions.symbol}_data_${mergedOptions.timeframe}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Export high-quality chart image as PDF
   */
  async exportHighQualityChart(
    canvasElement: HTMLCanvasElement,
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    const pdf = new jsPDF({
      orientation: mergedOptions.pageOrientation,
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add header
    this.addHeader(pdf, mergedOptions, pdfWidth);

    // Add chart
    const imgData = canvasElement.toDataURL('image/png', 1.0);
    const imgWidth = pdfWidth - mergedOptions.margins!.left - mergedOptions.margins!.right;
    const imgHeight = (canvasElement.height * imgWidth) / canvasElement.width;
    
    const yPosition = mergedOptions.margins!.top + 30;
    
    pdf.addImage(
      imgData,
      'PNG',
      mergedOptions.margins!.left,
      yPosition,
      imgWidth,
      Math.min(imgHeight, pdfHeight - yPosition - mergedOptions.margins!.bottom)
    );

    // Download
    const fileName = `${mergedOptions.symbol}_chart_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    pdf.save(fileName);
  }

  private prepareElementForCapture(element: HTMLElement): Map<HTMLElement, string> {
    const originalStyles = new Map<HTMLElement, string>();
    
    // Find all elements with potentially problematic colors
    const allElements = element.querySelectorAll('*');
    
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Check for unsupported color functions
      const bgColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      const borderColor = computedStyle.borderColor;
      
      if (bgColor.includes('lab(') || bgColor.includes('oklch(') || 
          color.includes('lab(') || color.includes('oklch(') ||
          borderColor.includes('lab(') || borderColor.includes('oklch(')) {
        
        // Store original style
        originalStyles.set(htmlEl, htmlEl.style.cssText);
        
        // Apply fallback colors
        if (bgColor.includes('lab(') || bgColor.includes('oklch(')) {
          htmlEl.style.backgroundColor = this.getFallbackColor(bgColor);
        }
        if (color.includes('lab(') || color.includes('oklch(')) {
          htmlEl.style.color = this.getFallbackColor(color);
        }
        if (borderColor.includes('lab(') || borderColor.includes('oklch(')) {
          htmlEl.style.borderColor = this.getFallbackColor(borderColor);
        }
      }
    });
    
    return originalStyles;
  }



 

  private getFallbackColor(colorString: string): string {
    // Simple fallback mapping for common cases
    if (colorString.includes('lab(') || colorString.includes('oklch(')) {
      // Try to extract lightness and convert to a simple RGB approximation
      // This is a basic fallback - you might want to use a proper color conversion library
      if (colorString.includes('0%') || colorString.includes('0 ')) return '#000000';
      if (colorString.includes('100%') || colorString.includes('1 ')) return '#ffffff';
      if (colorString.includes('50%') || colorString.includes('0.5')) return '#808080';
      return '#666666'; // Default gray
    }
    return colorString;
  }

  private addHeader(pdf: jsPDF, options: ExportOptions, pageWidth: number): void {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(options.title || 'Market Seasonality Calendar', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const subtitle = `${options.symbol} - ${options.timeframe} Timeframe`;
    pdf.text(subtitle, pageWidth / 2, 25, { align: 'center' });
  }

  private addFooter(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      const footerText = `Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')} | Page ${i} of ${pageCount}`;
      pdf.text(footerText, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
  }

  private addStatsPage(pdf: jsPDF, stats: CalendarStats): void {
    const margin = 15;
    let yPosition = margin + 20;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance Statistics', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    const statsData = [
      ['Total Trading Days', stats.totalDays.toString()],
      ['Gain Days', `${stats.gainDays} (${((stats.gainDays / stats.totalDays) * 100).toFixed(1)}%)`],
      ['Loss Days', `${stats.lossDays} (${((stats.lossDays / stats.totalDays) * 100).toFixed(1)}%)`],
      ['Win Rate', `${stats.winRate.toFixed(1)}%`],
      ['Total Gains', `${stats.totalGains.toFixed(2)}%`],
      ['Total Losses', `${stats.totalLosses.toFixed(2)}%`],
      ['Net Change', `${stats.netChange.toFixed(2)}%`],
      ['Average Change', `${stats.avgChange.toFixed(2)}%`],
      ['Maximum Gain', `${stats.maxGain.toFixed(2)}%`],
      ['Maximum Loss', `${stats.maxLoss.toFixed(2)}%`],
      ['Volatility', `${stats.volatility.toFixed(2)}%`],
      ['Average Volume', stats.avgVolume.toLocaleString()]
    ];

    statsData.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${label}:`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, margin + 70, yPosition);
      yPosition += 8;
    });
  }

 async exportDataAsCSV(
    data : Array<{time : string; change : number; volume? :number}>,
    options : Partial<ExportOptions> = {},

 ) : Promise<void> {
    const mergedOptions = {...this.defaultOptions, ...options};


    const csvRows = [
        ['Date', 'Change (%)', 'Volume', 'Type'],
        ...data.map(item => [
            format(new Date(item.time), 'yyyy-MM-dd'),
            item.change.toFixed(2),
            item.volume ? item.volume.toString() : 'N/A',
            item.change > 0  ? 'Gain' : item.change < 0 ? 'Loss' : 'Neutral'
        ])
    ];

    const csvContent = csvRows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], {type : 'text/csv;charset=utf-8;'});

    const filename = `${mergedOptions.symbol}_data_${mergedOptions.timeframe}_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();


    // Cleanup
    URL.revokeObjectURL(link.href);
 }







}

// Export utility functions
export const pdfExporter = new PDFExporter();


export const exportCalendarDataAsPDF = (
  data: Array<{ time: string; change: number; volume?: number }>,
  options?: Partial<ExportOptions>,
  stats?: CalendarStats
) => pdfExporter.exportCalendarData(data, options, stats);

export const exportEnhancedCalendarDataAsPDF = (
  data: Array<{ time: string; change: number; volume?: number }>,
  options?: Partial<ExportOptions>,
  stats?: CalendarStats
) => pdfExporter.exportEnhancedDataPDF(data, options, stats);

export const exportChartAsPDF = (
  canvasElement: HTMLCanvasElement,
  options?: Partial<ExportOptions>
) => pdfExporter.exportHighQualityChart(canvasElement, options);


export const exportDataAsCSV = (
    data: Array<{ time: string; change: number; volume?: number }>,
    options?: Partial<ExportOptions>
) => pdfExporter.exportDataAsCSV(data, options);