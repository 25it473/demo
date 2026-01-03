const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// @route   GET api/events
// @desc    Get all events (Members see approved, Admin sees all or filtered)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        // If status is provided in query, use it (allows members to see pending for voting)
        if (req.query.status) {
            query.status = req.query.status;
        } else {
            // Default behavior: Members sees approved, Admin sees all
            if (req.user.role !== 'admin') {
                query.status = 'approved';
            }
        }

        const events = await Event.find(query)
            .populate('proposedBy', 'username')
            .populate('tasks.assignedTo', 'username')
            .populate('discussion.user', 'username')
            .sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET api/events/my-proposals
// @desc    Get events proposed by current user
// @access  Private
router.get('/my-proposals', protect, async (req, res) => {
    try {
        const events = await Event.find({ proposedBy: req.user._id }).sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// @route   POST api/events
// @desc    Propose an event
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, description, venue, suggestedDate, expectedParticipants } = req.body;
    try {
        const event = new Event({
            title,
            description,
            venue,
            suggestedDate,
            expectedParticipants,
            proposedBy: req.user._id,
            status: 'pending'
        });
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT api/events/:id
// @desc    Update and/or Approve an event
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            // Check permissions: Admin only for now (or owner? but this is mainly for admin approvals/edits)
            if (req.user.role !== 'admin' && event.proposedBy.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            event.title = req.body.title || event.title;
            event.description = req.body.description || event.description;
            event.venue = req.body.venue || event.venue;
            event.suggestedDate = req.body.suggestedDate || event.suggestedDate;
            event.expectedParticipants = req.body.expectedParticipants || event.expectedParticipants;

            if (req.body.status) {
                event.status = req.body.status;
            }

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT api/events/:id/vote
// @desc    Vote for an event (up or down)
// @access  Private
router.put('/:id/vote', protect, async (req, res) => {
    const { type } = req.body; // 'up' or 'down'
    console.log(`Vote attempt: User ${req.user._id} voting ${type} on Event ${req.params.id}`);

    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            const userId = req.user._id.toString();

            // Initialize vote arrays if missing (migration for legacy data)
            if (!event.upvotes) event.upvotes = [];
            if (!event.downvotes) event.downvotes = [];

            // Check existing votes robustly
            const isUpvoted = event.upvotes.some(id => id.toString() === userId);
            const isDownvoted = event.downvotes.some(id => id.toString() === userId);

            console.log(`Current State - Up: ${isUpvoted}, Down: ${isDownvoted}`);

            if (type === 'up') {
                if (isUpvoted) {
                    // Remove upvote (toggle off)
                    event.upvotes = event.upvotes.filter(id => id.toString() !== userId);
                } else {
                    // Add upvote
                    event.upvotes.push(req.user._id);
                    // Remove downvote if exists
                    if (isDownvoted) {
                        event.downvotes = event.downvotes.filter(id => id.toString() !== userId);
                    }
                }
            } else if (type === 'down') {
                if (isDownvoted) {
                    // Remove downvote (toggle off)
                    event.downvotes = event.downvotes.filter(id => id.toString() !== userId);
                } else {
                    // Add downvote
                    event.downvotes.push(req.user._id);
                    // Remove upvote if exists
                    if (isUpvoted) {
                        event.upvotes = event.upvotes.filter(id => id.toString() !== userId);
                    }
                }
            }

            await event.save();
            console.log('Vote saved successfully');
            res.json(event);
        } else {
            console.log('Event not found');
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Vote Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// task management routes could go here...
// For brevity, skipping granular task routes initially, 
// assuming tasks are updated via a generic update or separate call if needed.
// Let's add a generic update for tasks/discussion simplified for now or a specific one.

// @route   POST api/events/:id/tasks
// @desc    Add a task to an event
// @access  Private/Admin
router.post('/:id/tasks', protect, async (req, res) => {
    const { title, assignedTo, deadline } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to add tasks' });
            }

            // Fix legacy data: ensure assignedTo is an array for existing tasks
            if (event.tasks) {
                event.tasks.forEach(task => {
                    if (task.assignedTo && !Array.isArray(task.assignedTo)) {
                        task.assignedTo = [task.assignedTo];
                    }
                });
            }

            // assignedTo comes as an array of IDs
            const task = {
                title,
                assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo],
                status: 'pending',
                completedBy: [],
                deadline: deadline ? new Date(deadline) : null
            };
            event.tasks.push(task);
            await event.save();
            const updatedEvent = await Event.findById(req.params.id)
                .populate('proposedBy', 'username')
                .populate('tasks.assignedTo', 'username');
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

// @route   PUT api/events/:id/tasks/:taskId
// @desc    Update task status (mark completed by user)
// @access  Private
router.put('/:id/tasks/:taskId', protect, async (req, res) => {
    // We only care about marking 'completed' for now primarily
    // But we keep generic status for admin manual overrides if needed (though UI button usually sends 'completed')
    const { status } = req.body;

    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            const task = event.tasks.id(req.params.taskId);
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            const userId = req.user._id.toString();
            // Check if user is one of the assignees
            const isAssignee = task.assignedTo.some(id => id.toString() === userId);

            // Initialize completedBy if missing (legacy data support)
            if (!task.completedBy) task.completedBy = [];

            if (req.user.role === 'admin' || isAssignee) {
                if (status === 'completed') {
                    // Logic: Add user to completedBy
                    if (!task.completedBy.some(id => id.toString() === userId)) {
                        task.completedBy.push(req.user._id);
                    }

                    // Check if ALL assignees have completed
                    // We need to compare lengths (unique IDs in completedBy vs assignedTo)
                    // (Assuming assignedTo handles unique IDs, otherwise Set logic needed)
                    const uniqueAssignees = new Set(task.assignedTo.map(id => id.toString()));
                    const uniqueCompleted = new Set(task.completedBy.map(id => id.toString()));

                    // Filter uniqueCompleted to ensuring they are actually valid assignees (in case of reassignment)
                    let validCompletions = 0;
                    uniqueCompleted.forEach(id => {
                        if (uniqueAssignees.has(id)) validCompletions++;
                    });

                    if (validCompletions >= uniqueAssignees.size) {
                        task.status = 'completed';
                    } else {
                        // If at least one has started/done, maybe mark in-progress explicitly?
                        // Or just keep as pending/in-progress.
                        task.status = 'in-progress';
                    }
                } else {
                    // Manual override (e.g., reset to pending)
                    task.status = status;
                    if (status === 'pending') task.completedBy = []; // Reset completions? Or keep? Reset seems safer for 'restart'.
                }

                await event.save();

                // Return fully populated to refresh UI
                const updatedEvent = await Event.findById(req.params.id)
                    .populate('proposedBy', 'username')
                    .populate('tasks.assignedTo', 'username');

                res.json(updatedEvent);
            } else {
                res.status(401).json({ message: 'Not authorized to update this task' });
            }
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST api/events/:id/discussion
// @desc    Add comment to event
// @access  Private
router.post('/:id/discussion', protect, async (req, res) => {
    const { text } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            const comment = {
                user: req.user._id,
                text,
                createdAt: Date.now()
            };
            event.discussion.push(comment);
            await event.save();
            const populatedEvent = await Event.findById(req.params.id)
                .populate('proposedBy', 'username')
                .populate('discussion.user', 'username');
            res.json(populatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check permissions: Admin or Event Owner
        if (req.user.role !== 'admin' && event.proposedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
