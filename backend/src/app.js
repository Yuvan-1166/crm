import express from "express";
import healthRouter from "./config/dbhealthcheck.js";
// ...existing code...

//---------------------------------------------------------------------------------------------------------------
// TO check db config
const app = express();

// ...existing code...

// Add health check route
app.use("/api", healthRouter);
//---------------------------------------------------------------------------------------------------------------------

// ...existing code...