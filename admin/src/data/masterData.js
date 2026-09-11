// Static seed data for the Master Data module.

// ---- District Master (hierarchy mapping) ----
export const states = ["Rajasthan", "Madhya Pradesh", "Uttar Pradesh", "Gujarat", "Tamil Nadu"];

export const districtsByState = {
  Rajasthan: ["Jaipur", "Jodhpur"],
  "Madhya Pradesh": ["Indore", "Bhopal"],
  "Uttar Pradesh": ["Lucknow", "Kanpur"],
  Gujarat: ["Ahmedabad", "Rajkot"],
  "Tamil Nadu": ["Coimbatore", "Madurai"],
};

export const fabricatorOptions = [
  "Fab Zenith", "Fab Prime", "Fab Sigma", "Fab Delta", "Fab Alpha",
  "Fab Bravo", "Fab Max", "Fab Star", "Fab Titan", "Fab Orion",
];

export const dgoOptions = [
  "Vikram Singh", "Rajesh Choudhary", "Mahesh Patel", "Sanjay Verma", "Deepak Agarwal",
  "Pradeep Yadav", "Hitesh Shah", "Nitin Mehta", "Karthik R", "Manikandan S",
];

export const tmOptions = [
  "Amit Kumar", "Sandeep Jat", "Kunal Sharma", "Nilesh Tiwari", "Rohit Gupta",
  "Anil Yadav", "Jignesh Patel", "Bhavesh Mehta", "Vishnu Prasad", "Ramesh Kumar",
];

export const dealerOptions = [
  "Shree Steel Traders", "Jat Steel Suppliers", "Patel Metal Mart", "Verma Steel Agency",
  "Gupta Steel House", "Yadav Metal Traders", "Patel Steel Corp", "Mehta Steel Suppliers",
  "Sri Lakshmi Steels", "Kumar Steel Traders",
];

export const distributorOptions = ["DB North", "DB West", "DB Central", "DB East", "DB South"];

export const initialDistrictMappings = [
  { id: 1, state: "Rajasthan", district: "Jaipur", fabricator: "Fab Zenith", dgo: "Vikram Singh", tm: "Amit Kumar", dealer: "Shree Steel Traders", distributor: "DB North" },
  { id: 2, state: "Rajasthan", district: "Jodhpur", fabricator: "Fab Prime", dgo: "Rajesh Choudhary", tm: "Sandeep Jat", dealer: "Jat Steel Suppliers", distributor: "DB West" },
  { id: 3, state: "Madhya Pradesh", district: "Indore", fabricator: "Fab Sigma", dgo: "Mahesh Patel", tm: "Kunal Sharma", dealer: "Patel Metal Mart", distributor: "DB Central" },
  { id: 4, state: "Madhya Pradesh", district: "Bhopal", fabricator: "Fab Delta", dgo: "Sanjay Verma", tm: "Nilesh Tiwari", dealer: "Verma Steel Agency", distributor: "DB Central" },
  { id: 5, state: "Uttar Pradesh", district: "Lucknow", fabricator: "Fab Alpha", dgo: "Deepak Agarwal", tm: "Rohit Gupta", dealer: "Gupta Steel House", distributor: "DB East" },
  { id: 6, state: "Uttar Pradesh", district: "Kanpur", fabricator: "Fab Bravo", dgo: "Pradeep Yadav", tm: "Anil Yadav", dealer: "Yadav Metal Traders", distributor: "DB East" },
  { id: 7, state: "Gujarat", district: "Ahmedabad", fabricator: "Fab Max", dgo: "Hitesh Shah", tm: "Jignesh Patel", dealer: "Patel Steel Corp", distributor: "DB West" },
  { id: 8, state: "Gujarat", district: "Rajkot", fabricator: "Fab Star", dgo: "Nitin Mehta", tm: "Bhavesh Mehta", dealer: "Mehta Steel Suppliers", distributor: "DB West" },
  { id: 9, state: "Tamil Nadu", district: "Coimbatore", fabricator: "Fab Titan", dgo: "Karthik R", tm: "Vishnu Prasad", dealer: "Sri Lakshmi Steels", distributor: "DB South" },
  { id: 10, state: "Tamil Nadu", district: "Madurai", fabricator: "Fab Orion", dgo: "Manikandan S", tm: "Ramesh Kumar", dealer: "Kumar Steel Traders", distributor: "DB South" },
];

// ---- Store Type Breakup ----
export const storeTypes = ["Retail", "Wholesale", "Hardware", "Distributor"];

export const initialStoreTypeBreakup = [
  { id: 1, counterId: "CTR1756", zone: "East", state: "Bihar", district: "Madhubani", dealerName: "Adhira Housing", primaryDB: "Shree Lakhi Metal", apr: 0.0, may: 30.0, jun: 0.0, l3mAvg: 10.0, storeType: "Retail" },
  { id: 2, counterId: "CTR1758", zone: "East", state: "Bihar", district: "Purnia", dealerName: "Sandeep Enterprises", primaryDB: "Shree Lakhi Metal", apr: 0.0, may: 25.0, jun: 0.0, l3mAvg: 8.33, storeType: "Wholesale" },
  { id: 3, counterId: "CTR1757", zone: "East", state: "Jharkhand", district: "Bokaro", dealerName: "Maharaja Commercial", primaryDB: "Shree Lakhi Metal", apr: 0.0, may: 30.0, jun: 0.0, l3mAvg: 10.0, storeType: "Retail" },
  { id: 4, counterId: "CTR1861_NEW", zone: "East", state: "Odisha", district: "TBD (Ganjam)", dealerName: "Krishna Enterprises", primaryDB: "Udayam Ispat", apr: 0.0, may: 0.0, jun: 21.59, l3mAvg: 7.2, storeType: "Hardware" },
  { id: 5, counterId: "CTR1670", zone: "East", state: "Odisha", district: "Kandhamal", dealerName: "Mahalaxmi Associate", primaryDB: "Udayam Ispat", apr: 5.18, may: 0.0, jun: 10.55, l3mAvg: 5.24, storeType: "Distributor" },
  { id: 6, counterId: "CTR1902", zone: "East", state: "West Bengal", district: "Siliguri", dealerName: "Shyam Metal", primaryDB: "RV Bazari", apr: 12.4, may: 8.0, jun: 15.2, l3mAvg: 11.87, storeType: "Retail" },
  { id: 7, counterId: "CTR1955", zone: "East", state: "West Bengal", district: "Alipurduar", dealerName: "Burman Hardware", primaryDB: "Bazari", apr: 0.0, may: 6.5, jun: 9.0, l3mAvg: 5.17, storeType: "Hardware" },
  { id: 8, counterId: "CTR2011", zone: "East", state: "Jharkhand", district: "Dhanbad", dealerName: "Kumar Steel House", primaryDB: "Shree Lakhi Metal", apr: 18.0, may: 20.0, jun: 14.5, l3mAvg: 17.5, storeType: "Wholesale" },
  { id: 9, counterId: "CTR2045", zone: "East", state: "Bihar", district: "Patna", dealerName: "Gupta Metal Traders", primaryDB: "Shree Lakhi Metal", apr: 22.3, may: 19.0, jun: 25.0, l3mAvg: 22.1, storeType: "Distributor" },
  { id: 10, counterId: "CTR2087", zone: "East", state: "Odisha", district: "Cuttack", dealerName: "Sahoo Enterprises", primaryDB: "Udayam Ispat", apr: 3.0, may: 4.2, jun: 0.0, l3mAvg: 2.4, storeType: "Retail" },
];

// ---- Universe Master ----
export const initialUniverseMaster = [
  { id: 1, counterId: "CTR0001", zone: "NorthEast", state: "MIZORAM", cluster: "Silchar", district: "Aizawl", dealerName: "Eastern India variety store", db1: "Shri Salasar", db2: "-", db3: "-", potential: 30 },
  { id: 2, counterId: "CTR0002", zone: "NorthEast", state: "MIZORAM", cluster: "Silchar", district: "Aizawl", dealerName: "K C Hardware Store Mizoram", db1: "Shri Salasar", db2: "-", db3: "-", potential: 5 },
  { id: 3, counterId: "CTR0003", zone: "NorthEast", state: "MIZORAM", cluster: "Silchar", district: "Aizawl", dealerName: "Kimtea Enterprise", db1: "Shri Salasar", db2: "-", db3: "-", potential: 100 },
  { id: 4, counterId: "CTR0004", zone: "NorthEast", state: "MIZORAM", cluster: "Silchar", district: "Aizawl", dealerName: "LALDAILOVA PACHUAU & SONS", db1: "Shri Salasar", db2: "-", db3: "-", potential: 12 },
  { id: 5, counterId: "CTR0005", zone: "NorthEast", state: "MIZORAM", cluster: "Silchar", district: "Aizawl", dealerName: "Lushai Engineering", db1: "Shri Salasar", db2: "-", db3: "-", potential: 60 },
  { id: 6, counterId: "CTR0006", zone: "NorthEast", state: "MIZORAM", cluster: "Silchar", district: "Aizawl", dealerName: "R4Brothers Business", db1: "Shri Salasar", db2: "-", db3: "-", potential: 10 },
  { id: 7, counterId: "CTR0007", zone: "East", state: "West Bengal", cluster: "Siliguri", district: "Alipurduar", dealerName: "Shyam Metal", db1: "RV", db2: "Bazari", db3: "-", potential: 100 },
  { id: 8, counterId: "CTR0008", zone: "East", state: "West Bengal", cluster: "Siliguri", district: "Alipurduar", dealerName: "Burman Hardware", db1: "Bazari", db2: "-", db3: "-", potential: 60 },
  { id: 9, counterId: "CTR0009", zone: "East", state: "West Bengal", cluster: "Siliguri", district: "Alipurduar", dealerName: "Jaigaon Hardware Agency", db1: "Bazari", db2: "-", db3: "-", potential: 50 },
  { id: 10, counterId: "CTR0010", zone: "East", state: "West Bengal", cluster: "Siliguri", district: "Alipurduar", dealerName: "Kanika Steel", db1: "RV", db2: "Bazari", db3: "-", potential: 50 },
  { id: 11, counterId: "CTR0011", zone: "East", state: "West Bengal", cluster: "Siliguri", district: "Alipurduar", dealerName: "Kundu Hardware", db1: "Bazari", db2: "-", db3: "-", potential: 50 },
  { id: 12, counterId: "CTR0012", zone: "East", state: "West Bengal", cluster: "Siliguri", district: "Alipurduar", dealerName: "Sumit Steel", db1: "Bazari", db2: "-", db3: "-", potential: 30 },
];

// ---- Field Visit Tracker: Retailer + Profiler ----
export const initialRetailerVisits = [
  { id: 1, date: "19-08-2026", zone: "South", state: "KL", rank: 1, name: "Fasal H", reportingManager: "Krishna Kumar Menon", totalCounterVisits: 7, productiveCounterVisits: 3, orderQty: 10.0, totalFabricatorsMet: 1 },
  { id: 2, date: "19-08-2026", zone: "East", state: "OD", rank: 2, name: "Markanda Charan Swain", reportingManager: "Sujoy Chakraborty", totalCounterVisits: 11, productiveCounterVisits: 3, orderQty: 10.0, totalFabricatorsMet: 1 },
  { id: 3, date: "19-08-2026", zone: "South", state: "KL", rank: 3, name: "Shahad MV", reportingManager: "Krishna Kumar Menon", totalCounterVisits: 11, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: null },
  { id: 4, date: "19-08-2026", zone: "South", state: "KL", rank: 4, name: "Sebin T S", reportingManager: "Krishna Kumar Menon", totalCounterVisits: 8, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: null },
  { id: 5, date: "19-08-2026", zone: "East", state: "WB", rank: 5, name: "Jaydip Ray", reportingManager: "Navonil Das", totalCounterVisits: 6, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: null },
  { id: 6, date: "19-08-2026", zone: "North", state: "HP", rank: 6, name: "Arup Deka Pandit", reportingManager: "Arup Deka", totalCounterVisits: null, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: null },
  { id: 7, date: "19-08-2026", zone: "North", state: "HP", rank: 6, name: "Arup Deka Pandit", reportingManager: "Arup Deka", totalCounterVisits: null, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: null },
  { id: 8, date: "19-08-2026", zone: "East", state: "JH", rank: 7, name: "Abhishekh Kumar Singh", reportingManager: "Abhishek Kumar", totalCounterVisits: 4, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: 1 },
  { id: 9, date: "19-08-2026", zone: "East", state: "OD", rank: 8, name: "Sujoy Chakraborty", reportingManager: "Sujoy Chakraborty", totalCounterVisits: 8, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: 1 },
  { id: 10, date: "19-08-2026", zone: "North East", state: "AS", rank: 9, name: "Sumit Singh", reportingManager: "Sumit Singh", totalCounterVisits: 6, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: null },
  { id: 11, date: "19-08-2026", zone: "West", state: "MP", rank: 10, name: "Shibakar Mishra", reportingManager: "Shibakar Mishra", totalCounterVisits: 7, productiveCounterVisits: null, orderQty: null, totalFabricatorsMet: 1 },
];

// ---- Field Visit Tracker: Fabricator ----
export const initialFabricatorVisits = [
  { id: 1, zone: "East", state: "WB", rank: 1, name: "Sujoy Kundu", reportingManager: "Navonil Das", forTheDay: { totalCounterVisits: 14, productiveCounterVisits: 1, totalFabricatorVisits: 9 }, mtd: { workingDays: 15, productiveCounterVisits: 5, totalOrderVolume: 13, totalFabricatorVisits: 162 } },
  { id: 2, zone: "North", state: "J&K", rank: 2, name: "Danish Gulzar", reportingManager: "Rashi Bhatt", forTheDay: { totalCounterVisits: 4, productiveCounterVisits: null, totalFabricatorVisits: 4 }, mtd: { workingDays: 17, productiveCounterVisits: 1, totalOrderVolume: null, totalFabricatorVisits: 188 } },
  { id: 3, zone: "North", state: "J&K", rank: 3, name: "Athar Hussain", reportingManager: "Rashi Bhatt", forTheDay: { totalCounterVisits: 10, productiveCounterVisits: null, totalFabricatorVisits: 10 }, mtd: { workingDays: 15, productiveCounterVisits: 8, totalOrderVolume: 54, totalFabricatorVisits: 198 } },
  { id: 4, zone: "East", state: "OD", rank: 4, name: "Nabin Kumar Dalabehera", reportingManager: "Markanda Charan Swain", forTheDay: { totalCounterVisits: 10, productiveCounterVisits: null, totalFabricatorVisits: 7 }, mtd: { workingDays: 15, productiveCounterVisits: null, totalOrderVolume: null, totalFabricatorVisits: 103 } },
  { id: 5, zone: "South", state: "AP", rank: 5, name: "Kari Tirumala", reportingManager: "Kandala Vinod", forTheDay: { totalCounterVisits: 12, productiveCounterVisits: null, totalFabricatorVisits: 10 }, mtd: { workingDays: 15, productiveCounterVisits: null, totalOrderVolume: null, totalFabricatorVisits: 117 } },
  { id: 6, zone: "East", state: "OD", rank: 6, name: "Kamalakanta Mallick", reportingManager: "Sujoy Chakraborty", forTheDay: { totalCounterVisits: 13, productiveCounterVisits: null, totalFabricatorVisits: 11 }, mtd: { workingDays: 14, productiveCounterVisits: 7, totalOrderVolume: 22, totalFabricatorVisits: 137 } },
  { id: 7, zone: "East", state: "WB", rank: 7, name: "Sujoy Kundu", reportingManager: "Navonil Das", forTheDay: { totalCounterVisits: 14, productiveCounterVisits: 1, totalFabricatorVisits: 9 }, mtd: { workingDays: 15, productiveCounterVisits: 5, totalOrderVolume: 13, totalFabricatorVisits: 162 } },
  { id: 8, zone: "North", state: "J&K", rank: 8, name: "Athar Hussain", reportingManager: "Rashi Bhatt", forTheDay: { totalCounterVisits: 10, productiveCounterVisits: null, totalFabricatorVisits: 10 }, mtd: { workingDays: 15, productiveCounterVisits: 8, totalOrderVolume: 54, totalFabricatorVisits: 198 } },
  { id: 9, zone: "South", state: "AP", rank: 9, name: "Kari Tirumala", reportingManager: "Kandala Vinod", forTheDay: { totalCounterVisits: 12, productiveCounterVisits: null, totalFabricatorVisits: 10 }, mtd: { workingDays: 15, productiveCounterVisits: null, totalOrderVolume: null, totalFabricatorVisits: 117 } },
  { id: 10, zone: "East", state: "OD", rank: 10, name: "Kamalakanta Mallick", reportingManager: "Sujoy Chakraborty", forTheDay: { totalCounterVisits: 13, productiveCounterVisits: null, totalFabricatorVisits: 11 }, mtd: { workingDays: 14, productiveCounterVisits: 7, totalOrderVolume: 22, totalFabricatorVisits: 137 } },
];
