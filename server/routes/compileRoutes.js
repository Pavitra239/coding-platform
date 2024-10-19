import express from "express";
import { compileCode } from "../controllers/compileController.js"; // Import the controller function

const router = express.Router();

// POST /api/v1/compile - Endpoint to compile and run code
router.post("/", compileCode);

export default router;
