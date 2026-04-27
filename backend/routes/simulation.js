const express = require('express');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to normalize cost to monthly
const normalizeToMonthly = (cost, billingCycle) => {
  return billingCycle === 'annual' ? cost / 12 : cost;
};

// GET /api/simulation/project - Get projections
router.get('/project', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subs = await Subscription.find({ userId });

    if (subs.length === 0) {
      return res.json({
        monthlyTotal: 0,
        annualTotal: 0,
        threeMonthProjection: 0,
        sixMonthProjection: 0,
        twelveMonthProjection: 0,
        subscriptions: []
      });
    }

    // Calculate monthly total
    const monthlyTotal = subs.reduce((total, sub) => {
      return total + normalizeToMonthly(sub.cost, sub.billingCycle);
    }, 0);

    const annualTotal = monthlyTotal * 12;

    // Build subscription breakdown with savings
    const subscriptionBreakdown = subs.map(sub => {
      const monthlyEquiv = normalizeToMonthly(sub.cost, sub.billingCycle);
      return {
        id: sub._id,
        name: sub.name,
        category: sub.category,
        cost: sub.cost,
        billingCycle: sub.billingCycle,
        monthlyEquivalent: monthlyEquiv,
        annualEquivalent: monthlyEquiv * 12,
        savings6Months: monthlyEquiv * 6,
        savings12Months: monthlyEquiv * 12
      };
    });

    res.json({
      monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
      annualTotal: parseFloat(annualTotal.toFixed(2)),
      threeMonthProjection: parseFloat((monthlyTotal * 3).toFixed(2)),
      sixMonthProjection: parseFloat((monthlyTotal * 6).toFixed(2)),
      twelveMonthProjection: parseFloat((monthlyTotal * 12).toFixed(2)),
      subscriptions: subscriptionBreakdown
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/simulation/whatif - What-if cancellation scenario
router.get('/whatif', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const excludeIds = req.query.exclude ? req.query.exclude.split(',') : [];
    const subs = await Subscription.find({ userId });

    // Calculate original monthly total
    const originalMonthly = subs.reduce((total, sub) => {
      return total + normalizeToMonthly(sub.cost, sub.billingCycle);
    }, 0);

    // Filter out excluded subscriptions
    const remaining = subs.filter(sub => !excludeIds.includes(sub._id.toString()));

    // Calculate new monthly total
    const newMonthly = remaining.reduce((total, sub) => {
      return total + normalizeToMonthly(sub.cost, sub.billingCycle);
    }, 0);

    const monthlySavings = originalMonthly - newMonthly;
    const annualSavings = monthlySavings * 12;
    const percentageSavings = originalMonthly > 0 ? (monthlySavings / originalMonthly) * 100 : 0;

    res.json({
      originalMonthly: parseFloat(originalMonthly.toFixed(2)),
      newMonthly: parseFloat(newMonthly.toFixed(2)),
      monthlySavings: parseFloat(monthlySavings.toFixed(2)),
      annualSavings: parseFloat(annualSavings.toFixed(2)),
      percentageSavings: parseFloat(percentageSavings.toFixed(2)),
      excludedCount: excludeIds.length
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
