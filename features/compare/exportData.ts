import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import domToImage from "dom-to-image";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      head?: string[][];
      body?: (string | number)[][];
      startY?: number;
      margin?: { top?: number; right?: number; bottom?: number; left?: number };
      theme?: "striped" | "grid" | "plain";
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

export interface ComparisonExportOptions {
  title?: string;
  comparisonType?: string;
  symbols?: string[];
  benchmark?: string;
  timeframe?: string;
  periods?: string[];
  includeMetrics?: boolean;
  includeChart?: boolean;
  includeRawData?: boolean;
  pageOrientation?: "portrait" | "landscape";
  quality?: number;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ComparisonMetrics {
  correlation: number;
  volatilityDifference: number;
  performanceGap: number;
  sharpeRatioA: number;
  sharpeRatioB: number;
}

export interface CompareChartData {
  time: string;
  [key: string]: string | number;
}

export class ComparisonPDFExporter {
  private defaultOptions: ComparisonExportOptions = {
    title: "Market Comparison Analysis",
    comparisonType: "multi-symbol",
    symbols: [],
    timeframe: "1M",
    includeMetrics: true,
    includeChart: true,
    includeRawData: true,
    pageOrientation: "landscape",
    quality: 1.0,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  };

  /**
   * Export complete comparison analysis with chart screenshot and data
   */
  async exportComparisonAnalysis(
    data: CompareChartData[],
    metrics: ComparisonMetrics | null,
    chartElement: HTMLElement,
    options: Partial<ComparisonExportOptions> = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    const pdf = new jsPDF({
      orientation: mergedOptions.pageOrientation,
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = mergedOptions.margins!.top;

    // Add header
    currentY = this.addComparisonHeader(
      pdf,
      mergedOptions,
      pageWidth,
      currentY
    );

    // Add comparison summary
    currentY = this.addComparisonSummary(
      pdf,
      mergedOptions,
      pageWidth,
      currentY
    );

    // Add metrics if available
    if (metrics && mergedOptions.includeMetrics) {
      currentY = this.addMetricsSection(pdf, metrics, pageWidth, currentY);
    }

    // Add chart screenshot if requested
    if (mergedOptions.includeChart && chartElement) {
      try {
        console.log("Attempting to capture chart...", chartElement);
        const chartImage = await this.captureChartImage(chartElement);
        console.log("Chart captured successfully");
        currentY = await this.addChartSection(
          pdf,
          chartImage,
          pageWidth,
          pageHeight,
          currentY,
          mergedOptions
        );
      } catch (error) {
        console.error("Failed to capture chart image:", error);
        currentY = this.addChartErrorMessage(
          pdf,
          error as Error,
          pageWidth,
          currentY
        );
      }
    }

    // Add raw data table if requested
    if (mergedOptions.includeRawData && data.length > 0) {
      const dataTableY = this.addDataTable(
        pdf,
        data,
        pageWidth,
        pageHeight,
        currentY,
        mergedOptions
      );
      currentY = dataTableY;
    }

    // Add footer
    this.addFooter(pdf);

    // Generate filename and download
    const fileName = this.generateFileName(mergedOptions);
    pdf.save(fileName);
  }

  /**
   * Export chart screenshot only with minimal context
   */
  async exportChartOnly(
    chartElement: HTMLElement,
    options: Partial<ComparisonExportOptions> = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    const pdf = new jsPDF({
      orientation: mergedOptions.pageOrientation,
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = mergedOptions.margins!.top;

    // Add minimal header
    currentY = this.addComparisonHeader(
      pdf,
      mergedOptions,
      pageWidth,
      currentY
    );

    // Add chart
    try {
      console.log("Attempting to capture chart...", chartElement);
      const chartImage = await this.captureChartImage(chartElement);
      console.log("Chart captured successfully");
      await this.addChartSection(
        pdf,
        chartImage,
        pageWidth,
        pageHeight,
        currentY,
        mergedOptions
      );
    } catch (error) {
      console.error("Failed to capture chart:", error);
      this.addChartErrorMessage(pdf, error as Error, pageWidth, currentY);
    }

    // Add footer
    this.addFooter(pdf);

    const fileName = this.generateFileName(mergedOptions, "chart");
    pdf.save(fileName);
  }

  /**
   * Export data as CSV
   */
  async exportDataAsCSV(
    data: CompareChartData[],
    options: Partial<ComparisonExportOptions> = {}
  ): Promise<void> {
    if (data.length === 0) return;

    const mergedOptions = { ...this.defaultOptions, ...options };

    // Get headers from first data row
    const headers = Object.keys(data[0]);

    const csvRows = [
      headers,
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          return typeof value === "number" ? value.toFixed(4) : String(value);
        })
      ),
    ];

    const csvContent = csvRows
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = this.generateFileName(mergedOptions, "data", "csv");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    // Cleanup
    URL.revokeObjectURL(link.href);
  }

  /**
   * Capture chart image using dom-to-image
   */
  private async captureChartImage(element: HTMLElement): Promise<string> {
    const chartContainer = this.findChartContainer(element);
    console.log("Chart container:", {
      outerHTML: chartContainer.outerHTML.slice(0, 200), // Truncate for readability
      width: chartContainer.offsetWidth,
      height: chartContainer.offsetHeight,
      isVisible:
        window.getComputedStyle(chartContainer).visibility !== "hidden",
      opacity: window.getComputedStyle(chartContainer).opacity,
      display: window.getComputedStyle(chartContainer).display,
    });

    // Wait for render with retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    const renderDelay = 1000;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Capture attempt ${attempts}...`);
      await this.waitForRender();

      const restoreStyles = this.ensureElementVisible(chartContainer);

      try {
        // Prepare DOM
        this.prepareClonedElement(document, chartContainer);

        // Force reflow
        chartContainer.getBoundingClientRect();

        const dataUrl = await domToImage.toPng(chartContainer, {
          quality: 0.95,
          bgcolor: "#ffffff",
          width: chartContainer.offsetWidth || 800,
          height: chartContainer.offsetHeight || 600,
          style: {
            transform: "none",
            transformOrigin: "initial",
            visibility: "visible",
            opacity: "1",
            position: "static", // Avoid Tailwind's absolute positioning
          },
          filter: (node: Node) => {
            const tagName = (node as HTMLElement).tagName?.toUpperCase();
            return (
              !["IFRAME", "OBJECT", "EMBED"].includes(tagName) &&
              !(
                node instanceof HTMLElement &&
                node.classList.contains("ignore-dom-to-image")
              )
            );
          },
        });

        if (!dataUrl || dataUrl === "data:,") {
          console.warn(`Attempt ${attempts} failed: Empty image`);
          if (attempts === maxAttempts) {
            throw new Error("Captured image is empty after maximum attempts");
          }
          continue;
        }

        console.log(
          "Chart captured successfully. Image size:",
          chartContainer.offsetWidth,
          "x",
          chartContainer.offsetHeight
        );
        return dataUrl;
      } catch (error) {
        console.warn(`Attempt ${attempts} failed:`, error);
        if (attempts === maxAttempts) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to capture chart: ${errorMessage}`);
        }
      } finally {
        restoreStyles();
      }
    }

    throw new Error("Failed to capture chart after all attempts");
  }

  /**
   * Find the actual chart container (usually canvas or svg)
   */
  private findChartContainer(element: HTMLElement): HTMLElement {
    console.log("Inspecting chart container:", element.outerHTML);
    const selectors = [
      "canvas",
      "svg",
      ".recharts-wrapper",
      ".recharts-surface",
      ".chart-container",
      ".tradingview-widget-container",
      "[data-chart]",
      ".apexcharts-canvas",
      ".highcharts-container",
    ];

    for (const selector of selectors) {
      const found = element.querySelector(selector) as HTMLElement;
      if (found && found.offsetWidth > 0 && found.offsetHeight > 0) {
        console.log(
          `Found chart element with selector: ${selector}`,
          found.outerHTML
        );
        return found;
      }
    }

    console.log("Using provided element as chart container", element.outerHTML);
    return element;
  }

  /**
   * Wait for any pending renders or animations
   */
  private async waitForRender(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 1000); // Increased timeout for chart rendering
        });
      });
    });
  }

  /**
   * Ensure element is visible and has proper dimensions
   */
  private ensureElementVisible(element: HTMLElement): () => void {
    const originalStyle = {
      visibility: element.style.visibility,
      opacity: element.style.opacity,
      display: element.style.display,
      position: element.style.position,
      width: element.style.width,
      height: element.style.height,
    };

    element.style.visibility = "visible";
    element.style.opacity = "1";
    element.style.display = "block";
    if (!element.style.width || element.offsetWidth === 0) {
      element.style.width = "800px";
    }
    if (!element.style.height || element.offsetHeight === 0) {
      element.style.height = "600px";
    }

    void element.offsetHeight;

    return () => {
      Object.assign(element.style, originalStyle);
    };
  }

  /**
   * Prepare cloned element for better rendering
   */
  private prepareClonedElement(
    clonedDoc: Document,
    _originalElement: HTMLElement
  ): void {
    try {
      const clonedElements = clonedDoc.querySelectorAll("*");

      clonedElements.forEach((el) => {
        const element = el as HTMLElement;
        if (element.style) {
          element.style.transform = "none";
          element.style.transformOrigin = "initial";
          if (element.style.visibility === "hidden") {
            element.style.visibility = "visible";
          }
          element.style.pointerEvents = "none";
        }

        this.fixUnsupportedColors(element);
      });

      const fontElements = clonedDoc.querySelectorAll(
        "text, tspan, .recharts-text"
      );
      fontElements.forEach((el) => {
        const element = el as HTMLElement;
        if (element.style) {
          element.style.fontFamily = "Arial, sans-serif";
        }
      });
    } catch (error) {
      console.warn("Error preparing cloned element:", error);
    }
  }

  /**
   * Fix unsupported color functions like lab(), oklab(), lch(), etc.
   */
  private fixUnsupportedColors(element: HTMLElement): void {
    try {
      const computedStyle = window.getComputedStyle(element);
      const problematicProperties = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "fill",
        "stroke",
        "stopColor",
      ];

      problematicProperties.forEach((prop) => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && this.isUnsupportedColorFunction(value)) {
          console.log(
            `Replacing ${prop} with value ${value} in element`,
            element
          );
          const fallbackColor = this.convertToSupportedColor(value);
          element.style.setProperty(prop, fallbackColor, "important");
        }
      });

      for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle.item(i);
        if (prop.startsWith("--")) {
          const value = computedStyle.getPropertyValue(prop);
          if (value && this.isUnsupportedColorFunction(value)) {
            console.log(
              `Replacing custom property ${prop} with value ${value} in element`,
              element
            );
            const fallbackColor = this.convertToSupportedColor(value);
            element.style.setProperty(prop, fallbackColor, "important");
          }
        }
      }

      Array.from(element.children).forEach((child) => {
        this.fixUnsupportedColors(child as HTMLElement);
      });
    } catch (error) {
      console.warn("Error fixing colors for element:", element, error);
    }
  }

  /**
   * Check if a color value uses unsupported functions
   */
  private isUnsupportedColorFunction(value: string): boolean {
    const unsupportedFunctions = /\b(lab|oklab|lch|oklch|color|hwb)\s*\(/i;
    return unsupportedFunctions.test(value);
  }

  /**
   * Convert unsupported color functions to supported ones
   */
  private convertToSupportedColor(value: string): string {
    if (value.includes("lab(") || value.includes("oklab(")) {
      const lightnessMatch = value.match(/(?:lab|oklab)\s*\(\s*([0-9.]+)/);
      if (lightnessMatch) {
        const lightness = Math.round(parseFloat(lightnessMatch[1]) * 2.55);
        return `rgb(${lightness}, ${lightness}, ${lightness})`;
      }
      return "#666666";
    }

    if (value.includes("lch(") || value.includes("oklch(")) {
      const lightnessMatch = value.match(/(?:lch|oklch)\s*\(\s*([0-9.]+)/);
      if (lightnessMatch) {
        const lightness = Math.round(parseFloat(lightnessMatch[1]) * 2.55);
        return `rgb(${lightness}, ${lightness}, ${lightness})`;
      }
      return "#666666";
    }

    if (value.includes("color(")) {
      return "#333333";
    }

    if (value.includes("hwb(")) {
      return "#666666";
    }

    return "#000000";
  }

  /**
   * Add error message when chart capture fails
   */
  private addChartErrorMessage(
    pdf: jsPDF,
    error: Error,
    pageWidth: number,
    startY: number
  ): number {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Chart Capture Failed", 20, currentY);
    currentY += 15;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 50, 50);

    const errorLines = [
      "Unable to capture chart image. This may be due to:",
      "• Chart not fully loaded when export was triggered",
      "• Browser security restrictions (CORS)",
      "• Chart element not visible or has zero dimensions",
      "• Complex SVG or Canvas rendering issues",
      "",
      "Suggestions:",
      "• Wait for chart to fully load before exporting",
      "• Try exporting data as CSV instead",
      "• Use browser screenshot functionality as alternative",
      "",
      `Technical error: ${error.message}`,
    ];

    errorLines.forEach((line) => {
      pdf.text(line, 20, currentY);
      currentY += 5;
    });

    pdf.setTextColor(0, 0, 0);
    return currentY + 10;
  }

  /**
   * Add comparison header with title and metadata
   */
  private addComparisonHeader(
    pdf: jsPDF,
    options: ComparisonExportOptions,
    pageWidth: number,
    startY: number
  ): number {
    let currentY = startY;

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      options.title || "Market Comparison Analysis",
      pageWidth / 2,
      currentY,
      { align: "center" }
    );
    currentY += 12;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    const subtitle = this.getComparisonTypeLabel(options.comparisonType || "");
    pdf.text(subtitle, pageWidth / 2, currentY, { align: "center" });
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Generated on ${format(new Date(), "MMMM dd, yyyy HH:mm")}`,
      pageWidth / 2,
      currentY,
      { align: "center" }
    );
    pdf.setTextColor(0, 0, 0);
    currentY += 15;

    return currentY;
  }

  /**
   * Add comparison summary section
   */
  private addComparisonSummary(
    pdf: jsPDF,
    options: ComparisonExportOptions,
    pageWidth: number,
    startY: number
  ): number {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Analysis Parameters", 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const summaryData: string[][] = [];

    summaryData.push([
      "Comparison Type",
      this.getComparisonTypeLabel(options.comparisonType || ""),
    ]);
    summaryData.push(["Timeframe", options.timeframe || "N/A"]);

    if (options.symbols && options.symbols.length > 0) {
      summaryData.push(["Symbols", options.symbols.join(", ")]);
    }

    if (options.benchmark) {
      summaryData.push(["Benchmark", options.benchmark]);
    }

    if (options.periods && options.periods.length > 0) {
      summaryData.push(["Periods", options.periods.join(" vs ")]);
    }

    autoTable(pdf, {
      body: summaryData,
      startY: currentY,
      margin: { left: 20, right: 20 },
      theme: "plain",
      bodyStyles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: {
          cellWidth: 40,
          fontStyle: "bold",
          textColor: [51, 65, 85],
        },
        1: {
          cellWidth: 80,
          textColor: [15, 23, 42],
        },
      },
    });

    return pdf.lastAutoTable?.finalY + 15 || currentY + 40;
  }

  /**
   * Add metrics section
   */
  private addMetricsSection(
    pdf: jsPDF,
    metrics: ComparisonMetrics,
    pageWidth: number,
    startY: number
  ): number {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Performance Metrics", 20, currentY);
    currentY += 10;

    const metricsData = [
      ["Correlation", `${(metrics.correlation * 100).toFixed(1)}%`],
      ["Volatility Difference", `${metrics.volatilityDifference.toFixed(2)}%`],
      [
        "Performance Gap",
        `${
          metrics.performanceGap >= 0 ? "+" : ""
        }${metrics.performanceGap.toFixed(2)}%`,
      ],
      ["Risk-Adjusted Return A", metrics.sharpeRatioA.toFixed(3)],
      ["Risk-Adjusted Return B", metrics.sharpeRatioB.toFixed(3)],
    ];

    autoTable(pdf, {
      head: [["Metric", "Value"]],
      body: metricsData,
      startY: currentY,
      margin: { left: 20, right: 20 },
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: {
          cellWidth: 60,
          fontStyle: "bold",
        },
        1: {
          cellWidth: 40,
          halign: "right",
        },
      },
    });

    return pdf.lastAutoTable?.finalY + 15 || currentY + 60;
  }

  /**
   * Add chart section
   */
  private async addChartSection(
    pdf: jsPDF,
    chartImage: string,
    pageWidth: number,
    pageHeight: number,
    startY: number,
    options: ComparisonExportOptions
  ): Promise<number> {
    let currentY = startY;

    const availableHeight = pageHeight - currentY - options.margins!.bottom;
    const minChartHeight = 80;

    if (availableHeight < minChartHeight) {
      pdf.addPage();
      currentY = options.margins!.top;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Comparison Chart", 20, currentY);
    currentY += 15;

    const maxWidth = pageWidth - options.margins!.left - options.margins!.right;
    const maxHeight = pageHeight - currentY - options.margins!.bottom - 20;

    let imgWidth = maxWidth;
    let imgHeight = (imgWidth * 9) / 16;

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = (imgHeight * 16) / 9;
    }

    const xOffset = (pageWidth - imgWidth) / 2;

    pdf.addImage(chartImage, "PNG", xOffset, currentY, imgWidth, imgHeight);

    return currentY + imgHeight + 20;
  }

  /**
   * Add data table section
   */
  private addDataTable(
    pdf: jsPDF,
    data: CompareChartData[],
    pageWidth: number,
    pageHeight: number,
    startY: number,
    options: ComparisonExportOptions
  ): number {
    let currentY = startY;

    if (currentY > pageHeight - 100) {
      pdf.addPage();
      currentY = options.margins!.top;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Raw Data", 20, currentY);
    currentY += 15;

    if (data.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("No data available", 20, currentY);
      return currentY + 10;
    }

    const headers = Object.keys(data[0]);
    const tableData = data.slice(0, 50).map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (typeof value === "number") {
          return header === "time" ? value.toString() : `${value.toFixed(2)}%`;
        }
        return String(value);
      })
    );

    autoTable(pdf, {
      head: [headers],
      body: tableData,
      startY: currentY,
      margin: { left: 15, right: 15 },
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const finalY = pdf.lastAutoTable?.finalY || currentY + 100;

    if (data.length > 50) {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Note: Only first 50 rows shown. Export CSV for complete data (${data.length} total rows).`,
        15,
        finalY + 10
      );
      pdf.setTextColor(0, 0, 0);
    }

    return finalY + 20;
  }

  /**
   * Add footer to all pages
   */
  private addFooter(pdf: jsPDF): void {
    const pageCount = pdf.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);

      const footerText = `Generated by Market Analysis Tool | Page ${i} of ${pageCount}`;
      pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    pdf.setTextColor(0, 0, 0);
  }

  /**
   * Generate appropriate filename
   */
  private generateFileName(
    options: ComparisonExportOptions,
    type: string = "analysis",
    extension: string = "pdf"
  ): string {
    const timestamp = format(new Date(), "yyyy-MM-dd-HHmm");
    const comparisonType =
      options.comparisonType?.replace("-", "_") || "comparison";
    const symbols = options.symbols?.join("-") || "market";

    return `${symbols}_${comparisonType}_${type}_${timestamp}.${extension}`;
  }

  /**
   * Get human-readable comparison type label
   */
  private getComparisonTypeLabel(comparisonType: string): string {
    const labels: Record<string, string> = {
      "time-periods": "Time Period Comparison",
      "multi-symbol": "Multi-Symbol Comparison",
      benchmark: "Benchmark Analysis",
      "period-over-period": "Period-over-Period Analysis",
    };

    return labels[comparisonType] || "Market Comparison";
  }
}

export const comparisonPDFExporter = new ComparisonPDFExporter();

export const exportComparisonAnalysis = (
  data: CompareChartData[],
  metrics: ComparisonMetrics | null,
  chartElement: HTMLElement,
  options?: Partial<ComparisonExportOptions>
) =>
  comparisonPDFExporter.exportComparisonAnalysis(
    data,
    metrics,
    chartElement,
    options
  );

export const exportComparisonChart = (
  chartElement: HTMLElement,
  options?: Partial<ComparisonExportOptions>
) => comparisonPDFExporter.exportChartOnly(chartElement, options);

export const exportComparisonDataAsCSV = (
  data: CompareChartData[],
  options?: Partial<ComparisonExportOptions>
) => comparisonPDFExporter.exportDataAsCSV(data, options);
