# PDF Export Documentation

## Overview

The PDF export functionality provides multiple ways to export your Market Seasonality Calendar data as high-quality PDF documents. This feature uses `jsPDF` and `html2canvas` libraries to generate professional reports.

## Available Export Options

### 1. Calendar View Export (Visual)
- **What it exports**: The entire calendar view as it appears on screen
- **Format**: High-resolution image of the calendar with statistics
- **Orientation**: Landscape for better calendar visibility
- **Includes**: Visual calendar, color coding, performance indicators, statistics summary

### 2. Data Table Export (Tabular)
- **What it exports**: Raw performance data in table format
- **Format**: Structured table with date, change %, and volume
- **Orientation**: Portrait for better table readability  
- **Includes**: Complete dataset, statistics summary, professional formatting

## How to Use

### From Calendar View
1. Navigate to your calendar view
2. Use the export buttons in the controls section:
   - **Calendar PDF**: Exports visual calendar view
   - **Data PDF**: Exports data in table format

### Export Options
Both export methods support customization:
- Title and symbol information
- Statistics inclusion
- Page orientation
- Quality settings
- Custom margins

## Features

### Professional Formatting
- **Headers**: Include symbol, timeframe, and generation date
- **Footers**: Page numbers and timestamp
- **Multi-page support**: Automatically splits large calendars
- **Statistics pages**: Comprehensive performance metrics

### Smart Layout
- **Responsive sizing**: Adjusts to content automatically  
- **Quality preservation**: High-resolution output
- **Loading indicators**: Shows progress during export
- **Error handling**: Graceful failure with user feedback

### Statistics Included
When statistics are enabled, exports include:
- Total trading days
- Win/loss days and percentages
- Total gains and losses
- Net change and average change
- Maximum gain/loss values
- Volatility measurements
- Average volume data
- Win rate percentage

## Technical Implementation

### PDF Export Class
```typescript
export class PDFExporter {
  // Main export methods
  exportCalendarView()    // Visual calendar export
  exportCalendarData()    // Data table export
  exportHighQualityChart() // Chart-specific export
}
```

### Export Functions
```typescript
// Convenient wrapper functions
exportCalendarAsPDF(elementId, options, stats)
exportCalendarDataAsPDF(data, options, stats)
exportChartAsPDF(canvasElement, options)
```

### Options Interface
```typescript
interface ExportOptions {
  title?: string;
  symbol?: string;
  timeframe?: string;
  includeStats?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  quality?: number;
  margins?: { top, right, bottom, left };
}
```

## Best Practices

### Before Exporting
1. **Load data**: Ensure calendar has loaded with data
2. **Select timeframe**: Choose appropriate time period
3. **Review display**: Verify calendar shows desired information
4. **Check statistics**: Enable stats if you want comprehensive metrics

### During Export
1. **Wait for completion**: Don't navigate away during export
2. **Monitor progress**: Loading indicator shows export status
3. **Handle errors**: Check console for any issues

### After Export
1. **Review PDF**: Check content and formatting
2. **File naming**: PDFs are auto-named with symbol and date
3. **Storage**: Files download to your default download folder

## File Naming Convention

Exported files follow this pattern:
- **Calendar View**: `{SYMBOL}_calendar_{TIMEFRAME}_YYYY-MM-DD.pdf`
- **Data Table**: `{SYMBOL}_data_{TIMEFRAME}_YYYY-MM-DD.pdf`
- **Charts**: `{SYMBOL}_chart_YYYY-MM-DD.pdf`

Examples:
- `BTCUSDT_calendar_1M_2025-07-25.pdf`
- `ETHUSDT_data_1D_2025-07-25.pdf`

## Troubleshooting

### Common Issues

**Export fails with "Element not found"**
- Solution: Ensure calendar is fully loaded before exporting

**PDF is blank or incomplete**  
- Solution: Wait for all data to load, check browser console for errors

**Poor quality output**
- Solution: Increase quality setting in export options

**Large file sizes**
- Solution: Reduce quality setting or export specific date ranges

**Browser compatibility**
- Solution: Use modern browsers (Chrome, Firefox, Safari, Edge)

### Error Messages

- **"No data available for export"**: Load calendar data first
- **"Element with ID not found"**: Calendar not rendered properly
- **"PDF export failed"**: Check browser console for technical details

## Performance Considerations

### Optimization Tips
1. **Data size**: Large date ranges may take longer to export
2. **Quality setting**: Higher quality = larger files and longer processing
3. **Browser memory**: Close other tabs for better performance
4. **Network stability**: Ensure stable connection during export

### Recommended Settings
- **Quality**: 1.0 for high-quality, 0.8 for faster processing
- **Orientation**: Landscape for calendars, Portrait for data tables
- **Statistics**: Include for comprehensive reports

## Integration

The PDF export is integrated into:
- **Calendar View**: Export buttons in controls section
- **Performance Charts**: Direct chart export capability
- **Dashboard**: Future integration planned

## Future Enhancements

Planned improvements:
- **Batch export**: Multiple timeframes at once
- **Custom templates**: User-defined PDF layouts  
- **Email integration**: Direct email sending
- **Cloud storage**: Export to Google Drive, Dropbox
- **Scheduled exports**: Automated report generation
- **Custom branding**: Logo and color customization

## Security & Privacy

- **Local processing**: All export processing happens in your browser
- **No data transmission**: Your data never leaves your device
- **Client-side only**: No server-side PDF generation
- **File security**: Downloads follow browser security policies

## Support

For technical issues or feature requests:
1. Check browser console for error details
2. Verify calendar data has loaded completely  
3. Try different export options
4. Report persistent issues with browser/OS information
