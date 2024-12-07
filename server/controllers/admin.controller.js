import User from '../models/user.js';

const adminController = {
    // for the sending all the pending request to the perticuler admin for the validation
    getPendingRequest: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;

            const getPendingUser = await User.find({ isApproved: false })
                .select("_id id mobileNo username branch semester batch")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: 1 });

            if (!getPendingUser.length) {
                return res.status(200).json({ success: false, message: "No pending users found" });
            }

            const totalUsers = await User.countDocuments({ isApproved: false });

            res.status(200).json({
                success: true,
                data: getPendingUser,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Accept request by admin
    acceptRequest: async (req, res, next) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (user.isApproved) {
                return res.status(400).json({ success: false, message: "User is already approved" });
            }

            const emailDomain = "@charusat.edu.in";
            const generatedEmail = `${user.id.toLowerCase()}${emailDomain}`;
            const generatedPassword = user.id;

            user.isApproved = true;
            user.email = generatedEmail;
            user.password = generatedPassword;
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
            const { userId } = req.body;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            await User.findByIdAndDelete(userId);

            res.status(200).json({
                success: true,
                message: "User request declined and user removed successfully"
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Accept all requests by admin
    acceptAllRequests: async (req, res, next) => {
        try {
            const pendingUsers = await User.find({ isApproved: false });

            if (pendingUsers.length === 0) {
                return res.status(404).json({ success: false, message: "No pending users to approve" });
            }

            const updatedUsers = await User.updateMany(
                { isApproved: false },
                { $set: { isApproved: true } }
            );

            res.status(200).json({
                success: true,
                message: `${updatedUsers.modifiedCount} users have been approved`,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // for declining all the users by admin
    declineAllRequests: async (req, res, next) => {
        try {
            const deletedUsers = await User.deleteMany({ isApproved: false });

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

export default adminController;