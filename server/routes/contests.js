import express from 'express';
import {
    createContest,
    getAllContests,
    getContestById,
    updateContest,
    deleteContest,
  } from '../controllers/contestController.js';
import { isAuthorized, isAdmin,isAdminOrFaculty } from "../middlewares/auth.js";

const router = express.Router();

// Middleware to ensure the user is authenticated
router.use(isAuthorized);

// Create a new contest
router.post('/create', isAdminOrFaculty,createContest);

// Get All Contests
router.get('/',isAdminOrFaculty, getAllContests);

// Get Contest by ID
router.get('/:id',isAdminOrFaculty, getContestById);

// Update Contest
router.put('/:id', isAdminOrFaculty,updateContest);

// Delete Contest
router.delete('/:id', isAdminOrFaculty,deleteContest);

export default router;
