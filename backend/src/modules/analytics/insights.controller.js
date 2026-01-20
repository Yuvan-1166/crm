import * as insightsService from "./insights.service.js";

/**
 * Insights Controller
 * HTTP handlers for enhanced analytics endpoints
 */

/**
 * @desc    Get comprehensive insights with filters
 * @route   GET /analytics/insights
 * @access  Employee/Admin
 */
export const getInsights = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const empId = req.user.role === 'ADMIN' ? null : req.user.empId;
    
    // Parse filters from query params
    const filters = {
      dateRange: req.query.datePreset 
        ? { preset: req.query.datePreset }
        : req.query.startDate || req.query.endDate
        ? { startDate: req.query.startDate, endDate: req.query.endDate }
        : null,
      source: req.query.source || null,
      assignedTo: req.query.assignedTo || null,
    };

    const insights = await insightsService.getComprehensiveInsights(companyId, empId, filters);
    
    res.json(insights);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get business performance metrics
 * @route   GET /analytics/insights/performance
 * @access  Employee/Admin
 */
export const getPerformance = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const empId = req.user.role === 'ADMIN' ? null : req.user.empId;
    
    const filters = {
      dateRange: req.query.datePreset 
        ? { preset: req.query.datePreset }
        : req.query.startDate || req.query.endDate
        ? { startDate: req.query.startDate, endDate: req.query.endDate }
        : null,
      source: req.query.source || null,
      assignedTo: req.query.assignedTo || null,
    };

    const performance = await insightsService.getBusinessPerformance(companyId, empId, filters);
    
    res.json(performance);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top customers analysis
 * @route   GET /analytics/insights/customers
 * @access  Employee/Admin
 */
export const getTopCustomers = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const empId = req.user.role === 'ADMIN' ? null : req.user.empId;
    
    const filters = {
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'revenue',
      dateRange: req.query.datePreset 
        ? { preset: req.query.datePreset }
        : null,
    };

    const customers = await insightsService.getTopCustomers(companyId, empId, filters);
    
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get deal bottleneck analysis
 * @route   GET /analytics/insights/bottlenecks
 * @access  Employee/Admin
 */
export const getBottlenecks = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const empId = req.user.role === 'ADMIN' ? null : req.user.empId;
    
    const filters = {
      dateRange: req.query.datePreset 
        ? { preset: req.query.datePreset }
        : null,
    };

    const bottlenecks = await insightsService.getDealBottlenecks(companyId, empId, filters);
    
    res.json(bottlenecks);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get actionable recommendations
 * @route   GET /analytics/insights/recommendations
 * @access  Employee/Admin
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const empId = req.user.role === 'ADMIN' ? null : req.user.empId;

    const recommendations = await insightsService.getRecommendations(companyId, empId);
    
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get filter options
 * @route   GET /analytics/insights/filters
 * @access  Employee/Admin
 */
export const getFilterOptions = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const empId = req.user.role === 'ADMIN' ? null : req.user.empId;

    const options = await insightsService.getFilterOptions(companyId, empId);
    
    res.json(options);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trend data for charts
 * @route   GET /analytics/insights/trends
 * @access  Employee/Admin
 */
export const getTrends = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const empId = req.user.role === 'ADMIN' ? null : req.user.empId;
    
    const filters = {
      period: req.query.period || 'weekly', // daily, weekly, monthly
      dateRange: req.query.datePreset 
        ? { preset: req.query.datePreset }
        : null,
    };

    const trends = await insightsService.getTrendsData(companyId, empId, filters);
    
    res.json(trends);
  } catch (error) {
    next(error);
  }
};
