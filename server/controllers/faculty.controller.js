import User from '../models/user.js';
import bcrypt from 'bcrypt';

const facultyController = {

    getPendingRequest: async (req, res, next) => {
        try {
            const facultyId = req.query.facultyId;
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;

            if (!facultyId) {
                return res.status(400).json({
                    success: false,
                    message: "Faculty ID is required"
                });
            }

            if (page <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Page number must be greater than 0."
                });
            }

            const [pendingUsers, totalUsers] = await Promise.all([
                User.find({
                    isApproved: false,
                    role: 'student',
                    facultyId: facultyId
                })
                    .select("_id id username mobileNo email branch semester batch")
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: 1 }),

                User.countDocuments({
                    isApproved: false,
                    role: 'student',
                    facultyId: facultyId
                })
            ]);

            if (pendingUsers.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: "No pending users found for this faculty"
                });
            }

            res.status(200).json({
                success: true,
                data: pendingUsers,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error("Error fetching pending users:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve pending requests"
            });
        }
    },

    // Accept request by faculty
    acceptRequest: async (req, res, next) => {
        try {
            const { userId, facultyId } = req.body;

            if (!userId || !facultyId) {
                return res.status(400).json({ success: false, message: "User ID and Faculty ID are required" });
            }

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (user.isApproved) {
                return res.status(400).json({ success: false, message: "User is already approved" });
            }

            if (user.facultyId.toString() !== facultyId) {
                return res.status(400).json({ success: false, message: "This student is not associated with the given faculty" });
            }

            const emailDomain = "@charusat.edu.in";
            const generatedEmail = `${user.id.toLowerCase()}${emailDomain}`;
            const generatedPassword = user.id;

            user.isApproved = true;
            user.email = generatedEmail;
            user.password = generatedPassword;

            user.facultyId = facultyId;

            await user.save();

            res.status(200).json({
                success: true,
                message: "User request accepted and approved",
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    branch: user.branch,
                    semester: user.semester,
                    batch: user.batch,
                },
            });
        } catch (error) {
            console.error("Error accepting user request:", error);
            res.status(500).json({ success: false, message: "An internal server error occurred", error: error.message });
        }
    },

    // decline request by admin
    declineRequest: async (req, res, next) => {
        try {
            const { userId, facultyId } = req.body;

            if (!userId || !facultyId) {
                return res.status(400).json({ success: false, message: "User ID and Faculty ID are required" });
            }

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (user.facultyId.toString() !== facultyId) {
                return res.status(400).json({ success: false, message: "This student is not associated with the given faculty" });
            }

            await User.findByIdAndDelete(userId);

            res.status(200).json({
                success: true,
                message: "User request declined and user removed successfully"
            });
        } catch (error) {
            console.error("Error declining user request:", error);
            res.status(500).json({
                success: false,
                message: error.message || "An internal server error occurred"
            });
        }
    },

    // Accept all requests by admin
    acceptAllRequests: async (req, res, next) => {
        try {
            const { facultyId } = req.body;

            if (!facultyId) {
                return res.status(400).json({ success: false, message: "Faculty ID is required" });
            }

            const pendingUsers = await User.find({ isApproved: false, role: 'student', facultyId: facultyId });
            console.log(pendingUsers);

            if (pendingUsers.length === 0) {
                return res.status(404).json({ success: false, message: "No pending users to approve for this faculty" });
            }

            const bulkOps = [];
            let approvedCount = 0;

            for (let user of pendingUsers) {
                if (user.isApproved) {
                    continue;
                }

                console.log(user);

                const emailDomain = "@charusat.edu.in";
                const generatedEmail = `${user.id.toLowerCase()}${emailDomain}`;
                const generatedPassword = await bcrypt.hash(user.id, 10);

                bulkOps.push({
                    updateOne: {
                        filter: { _id: user._id },
                        update: {
                            $set: {
                                email: generatedEmail,
                                password: generatedPassword,
                                isApproved: true,
                                facultyId: facultyId,
                            },
                        },
                    },
                });

                approvedCount++;
            }

            if (bulkOps.length > 0) {
                await User.bulkWrite(bulkOps);
            }

            res.status(200).json({
                success: true,
                message: `${approvedCount} users have been approved.`,
            });
        } catch (error) {
            console.error("Error approving users:", error);
            res.status(500).json({
                success: false,
                message: "An internal server error occurred",
                error: error.message,
            });
        }
    },

    // for declining all the users by admin
    declineAllRequests: async (req, res, next) => {
        try {
            const { facultyId } = req.body;

            if (!facultyId) {
                return res.status(400).json({ success: false, message: "Faculty ID is required" });
            }

            const deletedUsers = await User.deleteMany({ isApproved: false, role: 'student', facultyId });

            if (deletedUsers.deletedCount === 0) {
                return res.status(404).json({ success: false, message: "No pending users to decline" });
            }

            res.status(200).json({
                success: true,
                message: `${deletedUsers.deletedCount} users have been declined and removed successfully`
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default facultyController;