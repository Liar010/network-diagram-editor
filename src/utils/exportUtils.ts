import html2canvas from 'html2canvas';
// import ExcelJS from 'exceljs';
// import pptxgen from 'pptxgenjs';
import { NetworkDevice, Connection } from '../types/network';

export const exportToPNG = async (elementId: string, filename: string = 'network-diagram.png') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found. Make sure the diagram canvas is properly rendered.`);
    }

    // Find the react-flow__viewport to capture the entire diagram
    const viewport = element.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) {
      throw new Error('React Flow viewport not found');
    }

    // Get the bounding box of all elements to capture the entire diagram
    const nodes = viewport.querySelectorAll('.react-flow__node');
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // Calculate bounds from nodes
    nodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      minX = Math.min(minX, rect.left - elementRect.left);
      minY = Math.min(minY, rect.top - elementRect.top);
      maxX = Math.max(maxX, rect.right - elementRect.left);
      maxY = Math.max(maxY, rect.bottom - elementRect.top);
    });

    // Add padding
    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: false,
      width: width,
      height: height,
      x: minX - padding,
      y: minY - padding,
      scrollX: 0,
      scrollY: 0,
      windowWidth: width,
      windowHeight: height,
    });

    if (!canvas) {
      throw new Error('Failed to create canvas from element');
    }

    const dataUrl = canvas.toDataURL('image/png');
    if (!dataUrl || dataUrl === 'data:,') {
      throw new Error('Failed to generate image data');
    }

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    // Clean up
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 100);

  } catch (error) {
    console.error('PNG Export Error:', error);
    throw new Error(`Failed to export PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportToSVG = (devices: NetworkDevice[], connections: Connection[], filename: string = 'network-diagram.svg') => {
  try {
    if (!Array.isArray(devices) || !Array.isArray(connections)) {
      throw new Error('Invalid data: devices and connections must be arrays');
    }

    // Validate filename
    const sanitizedFilename = filename.replace(/[^\w\-. ]/g, '');
    if (!sanitizedFilename.endsWith('.svg')) {
      throw new Error('Filename must have .svg extension');
    }

    // Calculate SVG dimensions based on device positions with padding
    let minX = 0, minY = 0, maxX = 800, maxY = 600;
    if (devices.length > 0) {
      minX = Math.min(0, ...devices.map(d => d.position.x - 50));
      minY = Math.min(0, ...devices.map(d => d.position.y - 50));
      maxX = Math.max(800, ...devices.map(d => d.position.x + 150));
      maxY = Math.max(600, ...devices.map(d => d.position.y + 150));
    }

    // Create SVG content with error handling for device properties
    const deviceElements = devices.map(device => {
      try {
        const x = Number(device.position?.x) || 0;
        const y = Number(device.position?.y) || 0;
        const deviceType = String(device.type || 'unknown');
        const deviceName = String(device.name || 'Unnamed Device').replace(/[<>&"]/g, ''); // Sanitize XML

        return `
          <g transform="translate(${x}, ${y})">
            <rect x="0" y="0" width="60" height="60" fill="#e3f2fd" stroke="#1976d2" stroke-width="2" rx="5"/>
            <text x="30" y="35" text-anchor="middle" font-family="Arial" font-size="10">${deviceType}</text>
            <text x="30" y="80" text-anchor="middle" font-family="Arial" font-size="8">${deviceName}</text>
          </g>
        `;
      } catch (error) {
        console.warn(`Skipping device due to error:`, error);
        return '';
      }
    }).join('');

    const connectionElements = connections.map(conn => {
      try {
        const sourceDevice = devices.find(d => d.id === conn.source);
        const targetDevice = devices.find(d => d.id === conn.target);
        
        if (!sourceDevice || !targetDevice) {
          return '';
        }

        const x1 = Number(sourceDevice.position?.x) + 30 || 30;
        const y1 = Number(sourceDevice.position?.y) + 30 || 30;
        const x2 = Number(targetDevice.position?.x) + 30 || 30;
        const y2 = Number(targetDevice.position?.y) + 30 || 30;
        
        // Draw connections first so they appear behind devices
        return `
          <line 
            x1="${x1}" 
            y1="${y1}" 
            x2="${x2}" 
            y2="${y2}" 
            stroke="#666" 
            stroke-width="2"
            stroke-dasharray="${conn.type === 'wireless' ? '5,5' : '0'}"
          />
        `;
      } catch (error) {
        console.warn(`Skipping connection due to error:`, error);
        return '';
      }
    }).join('');

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="${maxX - minX}" height="${maxY - minY}" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" fill="white"/>
      ${connectionElements}
      ${deviceElements}
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = sanitizedFilename;
    link.href = url;
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 100);

  } catch (error) {
    console.error('SVG Export Error:', error);
    throw new Error(`Failed to export SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportToCSV = (devices: NetworkDevice[], connections: Connection[]) => {
  try {
    // Helper function to escape CSV values
    const escapeCSV = (value: any): string => {
      const str = String(value || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Create combined CSV with both devices and connections
    const csvSections: string[] = [];
    
    // Add metadata section
    csvSections.push('=== NETWORK DIAGRAM EXPORT ===');
    csvSections.push(`Export Date,${new Date().toISOString()}`);
    csvSections.push(`Total Devices,${devices.length}`);
    csvSections.push(`Total Connections,${connections.length}`);
    csvSections.push('');
    
    // Add devices section
    csvSections.push('=== DEVICES ===');
    const deviceHeaders = ['ID', 'Name', 'Type', 'Management IP', 'Hostname', 'Position X', 'Position Y'];
    csvSections.push(deviceHeaders.map(escapeCSV).join(','));
    
    devices.forEach(device => {
      const row = [
        device.id,
        device.name,
        device.type,
        device.config.managementIp || '',
        device.config.hostname || '',
        device.position.x,
        device.position.y
      ];
      csvSections.push(row.map(escapeCSV).join(','));
    });
    
    csvSections.push('');
    
    // Add interfaces section
    csvSections.push('=== NETWORK INTERFACES ===');
    const interfaceHeaders = ['Device ID', 'Device Name', 'Interface ID', 'Interface Name', 'Type', 'Status', 'IP Address', 'Subnet', 'VLANs', 'Mode', 'Speed', 'Description'];
    csvSections.push(interfaceHeaders.map(escapeCSV).join(','));
    
    devices.forEach(device => {
      if (device.interfaces && device.interfaces.length > 0) {
        device.interfaces.forEach(iface => {
          const row = [
            device.id,
            device.name,
            iface.id,
            iface.name,
            iface.type,
            iface.status,
            iface.ipAddress || '',
            iface.subnet || '',
            iface.vlans ? iface.vlans.join(';') : '',
            iface.mode || '',
            iface.speed || '',
            iface.description || ''
          ];
          csvSections.push(row.map(escapeCSV).join(','));
        });
      }
    });
    
    csvSections.push('');
    
    // Add connections section with interface information
    csvSections.push('=== CONNECTIONS ===');
    const connectionHeaders = ['ID', 'Source Device', 'Source Interface', 'Target Device', 'Target Interface', 'Connection Type', 'Label', 'Bandwidth', 'Status'];
    csvSections.push(connectionHeaders.map(escapeCSV).join(','));
    
    connections.forEach(conn => {
      const sourceDevice = devices.find(d => d.id === conn.source);
      const targetDevice = devices.find(d => d.id === conn.target);
      
      // Get interface names
      let sourceInterfaceName = conn.sourcePort || '';
      let targetInterfaceName = conn.targetPort || '';
      
      if (conn.sourceInterfaceId && sourceDevice?.interfaces) {
        const sourceInterface = sourceDevice.interfaces.find(i => i.id === conn.sourceInterfaceId);
        if (sourceInterface) {
          sourceInterfaceName = sourceInterface.name;
        }
      }
      
      if (conn.targetInterfaceId && targetDevice?.interfaces) {
        const targetInterface = targetDevice.interfaces.find(i => i.id === conn.targetInterfaceId);
        if (targetInterface) {
          targetInterfaceName = targetInterface.name;
        }
      }
      
      const row = [
        conn.id,
        sourceDevice?.name || conn.source,
        sourceInterfaceName,
        targetDevice?.name || conn.target,
        targetInterfaceName,
        conn.type,
        conn.label || '',
        conn.bandwidth || '',
        conn.style?.animated ? 'Active' : 'Normal'
      ];
      csvSections.push(row.map(escapeCSV).join(','));
    });
    
    // Create and download the unified CSV
    const csvContent = csvSections.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-diagram-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 100);
    
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportToJSON = (
  devices: NetworkDevice[], 
  connections: Connection[], 
  annotations: any[] = [], 
  drawings: any[] = [], 
  filename: string = 'network-diagram.json'
) => {
  try {
    if (!Array.isArray(devices) || !Array.isArray(connections)) {
      throw new Error('Invalid data: devices and connections must be arrays');
    }

    // Validate filename
    const sanitizedFilename = filename.replace(/[^\w\-. ]/g, '');
    if (!sanitizedFilename.endsWith('.json')) {
      throw new Error('Filename must have .json extension');
    }

    // Create export data with metadata
    const data = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      deviceCount: devices.length,
      connectionCount: connections.length,
      annotationCount: annotations.length,
      drawingCount: drawings.length,
      devices: devices.map(device => ({
        ...device,
        // Ensure required fields are present
        id: device.id || `device-${Math.random().toString(36).substr(2, 9)}`,
        type: device.type || 'unknown',
        name: device.name || 'Unnamed Device',
        position: {
          x: Number(device.position?.x) || 0,
          y: Number(device.position?.y) || 0
        },
        config: device.config || {}
      })),
      connections: connections.map(connection => ({
        ...connection,
        // Ensure required fields are present
        id: connection.id || `conn-${Math.random().toString(36).substr(2, 9)}`,
        source: connection.source || '',
        target: connection.target || '',
        type: connection.type || 'ethernet'
      })),
      annotations: annotations,
      drawings: drawings
    };

    // Validate JSON serialization
    const jsonString = JSON.stringify(data, null, 2);
    if (!jsonString || jsonString === '{}') {
      throw new Error('Failed to serialize data to JSON');
    }

    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = sanitizedFilename;
    link.href = url;
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 100);

  } catch (error) {
    console.error('JSON Export Error:', error);
    throw new Error(`Failed to export JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Export diagram to PowerPoint
 * TEMPORARILY DISABLED - ExcelJS and pptxgenjs cause build issues
 */
/*
export const exportToPowerPoint = async (
  devices: NetworkDevice[], 
  connections: Connection[], 
  filename: string = 'network-diagram.pptx'
): Promise<void> => {
  try {
    if (!Array.isArray(devices) || !Array.isArray(connections)) {
      throw new Error('Invalid data: devices and connections must be arrays');
    }

    // Validate filename
    const sanitizedFilename = filename.replace(/[^\w\-. ]/g, '');
    if (!sanitizedFilename.endsWith('.pptx')) {
      throw new Error('Filename must have .pptx extension');
    }

    const pptx = new pptxgen();
    
    // Set presentation properties
    pptx.author = 'Network Diagram Editor';
    pptx.company = 'Network Diagram Tool';
    pptx.title = 'Network Architecture Diagram';
    pptx.subject = 'Network Infrastructure Documentation';

    // Add title slide
    const titleSlide = pptx.addSlide();
    titleSlide.addText('Network Architecture Diagram', {
      x: 1,
      y: 1,
      w: 8,
      h: 1.5,
      fontSize: 32,
      bold: true,
      align: 'center',
      color: '1976d2'
    });

    titleSlide.addText(`${devices.length} Devices • ${connections.length} Connections`, {
      x: 1,
      y: 2.5,
      w: 8,
      h: 0.5,
      fontSize: 16,
      align: 'center',
      color: '666666'
    });

    titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
      x: 1,
      y: 3,
      w: 8,
      h: 0.5,
      fontSize: 14,
      align: 'center',
      color: '888888'
    });

    // Add diagram slide
    const diagramSlide = pptx.addSlide();
    diagramSlide.addText('Network Diagram', {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: '1976d2'
    });

    // Calculate scale and offset for PowerPoint coordinates
    if (devices.length > 0) {
      const positions = devices.map(d => d.position);
      const minX = Math.min(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxX = Math.max(...positions.map(p => p.x));
      const maxY = Math.max(...positions.map(p => p.y));
      
      const diagramWidth = maxX - minX || 400;
      const diagramHeight = maxY - minY || 300;
      
      // PowerPoint slide dimensions (in inches): ~10x7.5
      const slideWidth = 9;
      const slideHeight = 6;
      const scale = Math.min(slideWidth / diagramWidth, slideHeight / diagramHeight) * 72; // Convert to points
      
      const offsetX = 0.5 + (slideWidth - (diagramWidth * scale / 72)) / 2;
      const offsetY = 1 + (slideHeight - (diagramHeight * scale / 72)) / 2;

      // Add devices as shapes
      devices.forEach(device => {
        const x = offsetX + ((device.position.x - minX) * scale / 72);
        const y = offsetY + ((device.position.y - minY) * scale / 72);
        
        // Add device shape
        diagramSlide.addShape(pptx.ShapeType.rect, {
          x,
          y,
          w: 1.2,
          h: 0.8,
          fill: { color: 'e3f2fd' },
          line: { color: '1976d2', width: 2 },
          rectRadius: 0.1
        });

        // Add device label
        diagramSlide.addText(device.name, {
          x,
          y: y + 0.9,
          w: 1.2,
          h: 0.3,
          fontSize: 10,
          align: 'center',
          bold: true
        });

        // Add device type
        diagramSlide.addText(device.type, {
          x,
          y: y + 0.2,
          w: 1.2,
          h: 0.3,
          fontSize: 8,
          align: 'center',
          color: '666666'
        });

        // Add IP address if available
        if (device.config.ipAddress) {
          diagramSlide.addText(device.config.ipAddress, {
            x,
            y: y + 1.2,
            w: 1.2,
            h: 0.3,
            fontSize: 8,
            align: 'center',
            color: '888888'
          });
        }
      });

      // Add connections as lines
      connections.forEach(conn => {
        const sourceDevice = devices.find(d => d.id === conn.source);
        const targetDevice = devices.find(d => d.id === conn.target);
        
        if (sourceDevice && targetDevice) {
          const x1 = offsetX + ((sourceDevice.position.x - minX) * scale / 72) + 0.6;
          const y1 = offsetY + ((sourceDevice.position.y - minY) * scale / 72) + 0.4;
          const x2 = offsetX + ((targetDevice.position.x - minX) * scale / 72) + 0.6;
          const y2 = offsetY + ((targetDevice.position.y - minY) * scale / 72) + 0.4;
          
          diagramSlide.addShape(pptx.ShapeType.line, {
            x: x1,
            y: y1,
            w: x2 - x1,
            h: y2 - y1,
            line: { color: '666666', width: 2 }
          });
        }
      });
    }

    // Add device summary slide
    const summarySlide = pptx.addSlide();
    summarySlide.addText('Device Summary', {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: '1976d2'
    });

    // Group devices by type
    const devicesByType = devices.reduce((acc, device) => {
      if (!acc[device.type]) {
        acc[device.type] = [];
      }
      acc[device.type].push(device);
      return acc;
    }, {} as Record<string, NetworkDevice[]>);

    let yPos = 1.2;
    Object.entries(devicesByType).forEach(([type, devicesOfType]) => {
      summarySlide.addText(`${type.toUpperCase()} (${devicesOfType.length})`, {
        x: 0.5,
        y: yPos,
        w: 2,
        h: 0.4,
        fontSize: 14,
        bold: true
      });

      const deviceList = devicesOfType.map(d => d.name).join(', ');
      summarySlide.addText(deviceList, {
        x: 2.5,
        y: yPos,
        w: 6.5,
        h: 0.4,
        fontSize: 12
      });

      yPos += 0.6;
    });

    // Save the presentation
    await pptx.writeFile({ fileName: sanitizedFilename });

  } catch (error) {
    console.error('PowerPoint Export Error:', error);
    throw new Error(`Failed to export PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
*/

/**
 * Export device configuration to Excel
 * TEMPORARILY DISABLED - ExcelJS causes build issues
 */
/*
export const exportToExcel = async (
  devices: NetworkDevice[], 
  connections: Connection[], 
  filename: string = 'network-configuration.xlsx'
): Promise<void> => {
  try {
    if (!Array.isArray(devices) || !Array.isArray(connections)) {
      throw new Error('Invalid data: devices and connections must be arrays');
    }

    // Validate filename
    const sanitizedFilename = filename.replace(/[^\w\-. ]/g, '');
    if (!sanitizedFilename.endsWith('.xlsx')) {
      throw new Error('Filename must have .xlsx extension');
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Network Diagram Editor';
    workbook.created = new Date();

    // Devices worksheet
    const devicesWorksheet = workbook.addWorksheet('Devices', {
      properties: { tabColor: { argb: '1976d2' } }
    });

    // Define device columns
    devicesWorksheet.columns = [
      { header: 'Device ID', key: 'id', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'IP Address', key: 'ipAddress', width: 15 },
      { header: 'Subnet', key: 'subnet', width: 15 },
      { header: 'VLAN', key: 'vlan', width: 10 },
      { header: 'Position X', key: 'positionX', width: 10 },
      { header: 'Position Y', key: 'positionY', width: 10 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    // Style the header row
    devicesWorksheet.getRow(1).font = { bold: true };
    devicesWorksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'e3f2fd' }
    };

    // Add device data
    devices.forEach(device => {
      devicesWorksheet.addRow({
        id: device.id,
        name: device.name,
        type: device.type,
        ipAddress: device.config.ipAddress || '',
        subnet: device.config.subnet || '',
        vlan: device.config.vlan || '',
        positionX: device.position.x,
        positionY: device.position.y,
        notes: ''
      });
    });

    // Connections worksheet
    const connectionsWorksheet = workbook.addWorksheet('Connections', {
      properties: { tabColor: { argb: '4caf50' } }
    });

    connectionsWorksheet.columns = [
      { header: 'Connection ID', key: 'id', width: 15 },
      { header: 'Source Device', key: 'source', width: 20 },
      { header: 'Target Device', key: 'target', width: 20 },
      { header: 'Connection Type', key: 'type', width: 15 },
      { header: 'Source Interface', key: 'sourceInterface', width: 15 },
      { header: 'Target Interface', key: 'targetInterface', width: 15 },
      { header: 'Label', key: 'label', width: 20 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    // Style the header row
    connectionsWorksheet.getRow(1).font = { bold: true };
    connectionsWorksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'e8f5e8' }
    };

    // Add connection data with device names
    connections.forEach(connection => {
      const sourceDevice = devices.find(d => d.id === connection.source);
      const targetDevice = devices.find(d => d.id === connection.target);
      
      connectionsWorksheet.addRow({
        id: connection.id,
        source: sourceDevice ? `${sourceDevice.name} (${sourceDevice.id})` : connection.source,
        target: targetDevice ? `${targetDevice.name} (${targetDevice.id})` : connection.target,
        type: connection.type,
        sourceInterface: connection.sourceInterface || '',
        targetInterface: connection.targetInterface || '',
        label: connection.label || '',
        notes: ''
      });
    });

    // Summary worksheet
    const summaryWorksheet = workbook.addWorksheet('Summary', {
      properties: { tabColor: { argb: 'ff9800' } }
    });

    summaryWorksheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 15 },
      { header: 'Details', key: 'details', width: 40 }
    ];

    // Style the header row
    summaryWorksheet.getRow(1).font = { bold: true };
    summaryWorksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'fff3e0' }
    };

    // Add summary data
    const devicesByType = devices.reduce((acc, device) => {
      acc[device.type] = (acc[device.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    summaryWorksheet.addRow({
      metric: 'Total Devices',
      value: devices.length,
      details: Object.entries(devicesByType).map(([type, count]) => `${type}: ${count}`).join(', ')
    });

    summaryWorksheet.addRow({
      metric: 'Total Connections',
      value: connections.length,
      details: `${connections.filter(c => c.type === 'ethernet').length} Ethernet, ${connections.filter(c => c.type === 'fiber').length} Fiber`
    });

    summaryWorksheet.addRow({
      metric: 'Export Date',
      value: new Date().toLocaleDateString(),
      details: `Generated by Network Diagram Editor`
    });

    // Auto-fit columns
    [devicesWorksheet, connectionsWorksheet, summaryWorksheet].forEach(worksheet => {
      worksheet.columns.forEach(column => {
        if (column.key) {
          let maxLength = 0;
          worksheet.getColumn(column.key).eachCell({ includeEmpty: false }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            maxLength = Math.max(maxLength, columnLength);
          });
          column.width = Math.min(50, Math.max(10, maxLength + 2));
        }
      });
    });

    // Save the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = sanitizedFilename;
    link.href = url;
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 100);

  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
*/