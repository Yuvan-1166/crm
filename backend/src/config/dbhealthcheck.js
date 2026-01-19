import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// Cache health status to avoid excessive DB queries
let lastHealthCheck = null;
let lastCheckTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

/**
 * @route   GET /api/health
 * @desc    Health check endpoint - keeps backend & DB alive
 * @access  Public
 * 
 * Optimizations:
 * - Caches result for 5 seconds to prevent DB flooding
 * - Uses lightweight SELECT 1 query
 * - Returns response time metrics
 */
router.get("/health", async (req, res) => {
  const now = Date.now();
  
  // Return cached result if within cache window
  if (lastHealthCheck && (now - lastCheckTime) < CACHE_DURATION) {
    return res.json({
      ...lastHealthCheck,
      cached: true,
    });
  }

  const startTime = now;
  
  try {
    // Lightweight ping query
    await db.query("SELECT 1");
    
    const responseTime = Date.now() - startTime;
    
    lastHealthCheck = {
      status: "ok",
      database: "connected",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    };
    lastCheckTime = now;

    res.json({ ...lastHealthCheck, cached: false });
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    
    // Clear cache on error
    lastHealthCheck = null;
    lastCheckTime = 0;

    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route   GET /api/ping
 * @desc    Ultra-lightweight ping (no DB) - just confirms server is alive
 * @access  Public
 */
router.get("/ping", (req, res) => {
  res.json({ pong: true, timestamp: Date.now() });
});

export default router;
