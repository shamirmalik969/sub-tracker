const express = require('express');
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');
const { validateSubscription } = require('../middleware/validator');

const router = express.Router();

// GET /api/subscriptions - Get all subscriptions for user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subs = await Subscription.find({ userId }).sort({ createdAt: -1 });
    res.json(subs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/subscriptions - Create new subscription
router.post('/', auth, validateSubscription, async (req, res) => {
  try {
    const { name, category, cost, billingCycle } = req.body;
    const userId = req.user.userId;

    const newSub = new Subscription({
      userId,
      name,
      category,
      cost,
      billingCycle
    });

    await newSub.save();
    res.status(201).json(newSub);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/subscriptions/:id - Delete subscription
router.delete('/:id', auth, async (req, res) => {
  try {
    const subId = req.params.id;
    const userId = req.user.userId;

    // Verify subscription belongs to user
    const sub = await Subscription.findOneAndDelete({ _id: subId, userId });

    if (!sub) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }

    res.json({ msg: 'Subscription deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/subscriptions/stats/category - Category aggregation
router.get('/stats/category', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const stats = await Subscription.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          totalCost: { $sum: '$cost' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/subscriptions/stats/billing - Billing cycle distribution
router.get('/stats/billing', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const stats = await Subscription.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$billingCycle',
          totalCost: { $sum: '$cost' },
          avgCost: { $avg: '$cost' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
