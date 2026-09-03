import {
    performanceTool,
    getPerformanceStatistics
} from "./tools/performance.tool.js";

export const toolDefinitions = [
    performanceTool
]
export const toolHandlers = {
    get_performance: getPerformanceStatistics
}