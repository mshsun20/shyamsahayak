// Static seed data for the Profile page.

export const initialProfileInfo = {
  employeeId: "ADM001",
  fullName: "Admin User",
  role: "Super Admin",
  email: "admin@shyammetalics.com",
  mobile: "+91 98765 43210",
  dateOfJoining: "01 Jan 2024",
  lastLogin: "12 Aug 2026, 10:31 AM",
  status: "Active",
  pin: "1234",
  lastPinChanged: "05 Aug 2026, 11:15 AM",
};

export const activityLog = [
  { id: 1, dateTime: "12 Aug 2026, 10:31 AM", activity: "Login", module: "Authentication", details: "Login successful", ip: "192.168.1.10" },
  { id: 2, dateTime: "12 Aug 2026, 10:15 AM", activity: "Viewed User List", module: "Users & Mapping", details: "Viewed all users", ip: "192.168.1.10" },
  { id: 3, dateTime: "12 Aug 2026, 09:58 AM", activity: "Updated User", module: "Users & Mapping", details: "Updated user: John Doe (USR102)", ip: "192.168.1.10" },
  { id: 4, dateTime: "12 Aug 2026, 09:30 AM", activity: "Created Article", module: "Content Management", details: "Created article: 'Safety Guidelines'", ip: "192.168.1.10" },
  { id: 5, dateTime: "11 Aug 2026, 06:45 PM", activity: "Logout", module: "Authentication", details: "Logout successful", ip: "192.168.1.10" },
  { id: 6, dateTime: "11 Aug 2026, 03:20 PM", activity: "Added Product", module: "Content Management", details: "Added product: Tiger GC Sheet", ip: "192.168.1.10" },
  { id: 7, dateTime: "11 Aug 2026, 11:05 AM", activity: "Login", module: "Authentication", details: "Login successful", ip: "192.168.1.14" },
  { id: 8, dateTime: "10 Aug 2026, 05:40 PM", activity: "Deleted User", module: "Users & Mapping", details: "Deleted user: Ritu Bansal (EMP10014)", ip: "192.168.1.10" },
  { id: 9, dateTime: "10 Aug 2026, 02:15 PM", activity: "Updated Scheme", module: "Content Management", details: "Updated scheme: Monsoon Offer 2025", ip: "192.168.1.10" },
  { id: 10, dateTime: "10 Aug 2026, 09:00 AM", activity: "Login", module: "Authentication", details: "Login successful", ip: "192.168.1.10" },
  { id: 11, dateTime: "09 Aug 2026, 04:50 PM", activity: "Added Mapping", module: "Master Data", details: "Added district mapping: Coimbatore", ip: "192.168.1.10" },
  { id: 12, dateTime: "09 Aug 2026, 01:10 PM", activity: "Logout", module: "Authentication", details: "Logout successful", ip: "192.168.1.10" },
  { id: 13, dateTime: "09 Aug 2026, 10:05 AM", activity: "Login", module: "Authentication", details: "Login successful", ip: "192.168.1.10" },
  { id: 14, dateTime: "08 Aug 2026, 06:30 PM", activity: "Changed PIN", module: "Authentication", details: "PIN updated successfully", ip: "192.168.1.10" },
  { id: 15, dateTime: "08 Aug 2026, 09:15 AM", activity: "Login", module: "Authentication", details: "Login successful", ip: "192.168.1.10" },
];
