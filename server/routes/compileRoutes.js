import express from "express";
import { compileCode, saveCode, getCode } from "../controllers/compileController.js";

const router = express.Router();

// POST /api/v1/compile - Endpoint to compile and run code
router.post("/", compileCode);

// POST /api/v1/saveCode - Endpoint to save code draft
router.post("/saveCode", saveCode);

// GET /api/v1/getCode - Endpoint to get saved code draft
router.get("/getCode", getCode);

export default router;
