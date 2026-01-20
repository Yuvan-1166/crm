import * as insightsRepo from "./insights.repo.js";

/**
 * Insights Service
 * Business logic for enhanced analytics and insights
 */

/**
 * Get business performance metrics with filters
 */
export const getBusinessPerformance = async (companyId, empId, filters) => {
  return insightsRepo.getBusinessPerformance(companyId, empId, filters);
};

/**
 * Get top customers analysis
 */
export const getTopCustomers = async (companyId, empId, filters) => {
  return insightsRepo.getTopCustomers(companyId, empId, filters);
};

/**
 * Get deal bottleneck analysis
 */
export const getDealBottlenecks = async (companyId, empId, filters) => {
  return insightsRepo.getDealBottlenecks(companyId, empId, filters);
};

/**
 * Get actionable recommendations
 */
export const getRecommendations = async (companyId, empId) => {
  return insightsRepo.getRecommendations(companyId, empId);
};

/**
 * Get filter options for dropdowns
 */
export const getFilterOptions = async (companyId, empId) => {
  return insightsRepo.getFilterOptions(companyId, empId);
};

/**
 * Get trend data for charts
 */
export const getTrendsData = async (companyId, empId, filters) => {
  return insightsRepo.getTrendsData(companyId, empId, filters);
};

/**
 * Get comprehensive insights (all data in one call)
 */
export const getComprehensiveInsights = async (companyId, empId, filters = {}) => {
  const [
    performance,
    customers,
    bottlenecks,
    recommendations,
    filterOptions,
    trends,
  ] = await Promise.all([
    insightsRepo.getBusinessPerformance(companyId, empId, filters),
    insightsRepo.getTopCustomers(companyId, empId, filters),
    insightsRepo.getDealBottlenecks(companyId, empId, filters),
    insightsRepo.getRecommendations(companyId, empId),
    insightsRepo.getFilterOptions(companyId, empId),
    insightsRepo.getTrendsData(companyId, empId, filters),
  ]);

  return {
    performance,
    customers,
    bottlenecks,
    recommendations,
    filterOptions,
    trends,
  };
};
