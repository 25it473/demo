const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET api/stats/member-stats
// @desc    Get stats for member dashboard
// @access  Private
router.get('/member-stats', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const upcomingEvents = await Event.countDocuments({ status: 'approved', suggestedDate: { $gte: new Date() } });
        // Fallback for demo if no dates set, just approved count
        const allApproved = await Event.countDocuments({ status: 'approved' });

        const myProposals = await Event.countDocuments({ proposedBy: userId });
        // Calculate tasks
        const eventsWithMyTasks = await Event.find({ 'tasks.assignedTo': userId });
        let tasksCompleted = 0;
        let tasksPending = 0;

        eventsWithMyTasks.forEach(event => {
            if (event.tasks) {
                event.tasks.forEach(task => {
                    // assignedTo is an array of ObjectIds
                    if (task.assignedTo && task.assignedTo.some(id => id.toString() === userId.toString())) {
                        if (task.status === 'completed') tasksCompleted++;
                        else tasksPending++;
                    }
                });
            }
        });

        res.json({
            upcomingEvents: upcomingEvents || allApproved,
            myProposals,
            tasksCompleted,
            tasksPending
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
