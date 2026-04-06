// Utility functions for Durvesh Parking

// Generate unique ticket code
export const generateTicketCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = 'DP'; // Durvesh Parking
  let code = prefix;
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Format vehicle number (Indian format)
export const formatVehicleNumber = (input: string): string => {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return cleaned.slice(0, 2) + '-' + cleaned.slice(2);
  if (cleaned.length <= 6) return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4);
  return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 10);
};

// Validate Indian vehicle number
export const isValidVehicleNumber = (vehicleNo: string): boolean => {
  const cleaned = vehicleNo.replace(/[-\s]/g, '');
  // Indian format: 2 letters + 2 digits + 1-2 letters + 4 digits (e.g., MH12AB1234)
  const pattern = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
  return pattern.test(cleaned);
};

// Calculate parking fee
export const calculateFee = (durationMins: number, hourlyRate: number): number => {
  const hours = Math.ceil(durationMins / 60);
  return hours * hourlyRate;
};

// Format duration
export const formatDuration = (mins: number): string => {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
};

// Format time
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format date
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format date+time
export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)}, ${formatTime(date)}`;
};

// Calculate elapsed time in minutes
export const getElapsedMinutes = (entryTime: string): number => {
  const entry = new Date(entryTime);
  const now = new Date();
  return Math.floor((now.getTime() - entry.getTime()) / 60000);
};

// Check if parking lot is currently open
export const isParkingOpen = (openHour: number = 10, closeHour: number = 20): boolean => {
  return true;
};

// Get greeting based on time
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Generate parking receipt HTML
export const generateReceiptHTML = (session: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 16px; }
        .header h1 { color: #6C63FF; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 4px 0; }
        .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .total { font-size: 20px; text-align: center; margin-top: 16px; color: #6C63FF; }
        .footer { text-align: center; margin-top: 24px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🅿️ Durvesh Parking</h1>
        <p>Parking Receipt</p>
      </div>
      <div class="detail"><span class="label">Ticket</span><span class="value">${session.ticket_code}</span></div>
      <div class="detail"><span class="label">Vehicle</span><span class="value">${session.vehicle_no}</span></div>
      <div class="detail"><span class="label">Entry</span><span class="value">${formatDateTime(session.entry_time)}</span></div>
      ${session.exit_time ? `<div class="detail"><span class="label">Exit</span><span class="value">${formatDateTime(session.exit_time)}</span></div>` : ''}
      ${session.duration_mins ? `<div class="detail"><span class="label">Duration</span><span class="value">${formatDuration(session.duration_mins)}</span></div>` : ''}
      <div class="total">Amount Paid: ₹${session.amount_paid}</div>
      <div class="footer">Thank you for parking with Durvesh Parking!</div>
    </body>
    </html>
  `;
};
