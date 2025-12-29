import express from 'express';
import {
    createContest,
    getAllContests,
    getContestById,
    updateContest,
    deleteContest,
  } from '../controllers/contestController.js';
import { isAuthorized, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Middleware to ensure the user is authenticated
router.use(isAuthorized);

// Create a new contest
router.post('/create', isAdmin,createContest);

// Get All Contests
router.get('/', getAllContests);

// Get Contest by ID
router.get('/:id', getContestById);

// Update Contest
router.put('/:id', isAdmin,updateContest);

// Delete Contest
router.delete('/:id', isAdmin,deleteContest);

export default router;
