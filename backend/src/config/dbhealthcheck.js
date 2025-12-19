import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: error.message });
  }
});

export default router;