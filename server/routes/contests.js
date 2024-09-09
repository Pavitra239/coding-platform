import express from 'express';
import { createContest } from '../controllers/contestController.js';
import { isAuthorized, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Middleware to ensure the user is authenticated
router.use(isAuthorized);

// Create a new contest
router.post('/create', isAdmin,createContest);

export default router;
