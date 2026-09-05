export const performanceTool = {
  name: "get_performance",
  description: `
    Get business performance information
    for the authenticated employee.Use this tool when the user asks about: -sales performance - monthly performance - target - achievement - KPI - performance summary - target versus achievement - monthly target or achievement The tool requires a month in YYYY - MM format.IMPORTANT DATE RULE: -If the user specifies a year, use that year. - If the user specifies only a month, use the current calendar year. - For example,
        if the current year is 2026 and the user says "Show my performance for August", use "2026-08".
    `,
  input_schema: {
    type: "object",
    properties: {
      month: {
        type: "string",
        description: "Performance month in MM format. If the user provides only a month name, use the current calendar year.",
      },
      year: {
        type: "string",
        description: "Performance month in YYYY format. If the user provides only a month name, use the current calendar year.",
      },
    },
    required: ["month"],
  },
};

export const getPerformanceStatistics = async (input) => {
  const { month, year, user } = input;

  console.log("Executing get_performance tool");
  console.log("Authenticated user:", user);
  console.log("Requested month:", month);
  console.log("Requested month:", year);

  // Temporary dummy data
  return {
    employeeId: user?.employeeId || "DUMMY-EMP-001",
    month,
    year,
    target: 100,
    achievement: 87,
    achievementPercentage: 87,
    fabricatorsOnboarded: 62,
    outletsCovered: 41,
    activeStores: 9,
    activeSites: 6,
  };
};
