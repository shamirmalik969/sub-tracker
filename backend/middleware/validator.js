const validateSubscription = (req, res, next) => {
  const { name, category, cost, billingCycle } = req.body;

  if (!name || !category || cost === undefined || !billingCycle) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ msg: 'Name must be a non-empty string' });
  }

  if (typeof cost !== 'number' || cost <= 0) {
    return res.status(400).json({ msg: 'Cost must be a positive number' });
  }

  const validCategories = ['entertainment', 'productivity', 'utilities', 'health', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ msg: 'Invalid category' });
  }

  if (billingCycle !== 'monthly' && billingCycle !== 'annual') {
    return res.status(400).json({ msg: 'Billing cycle must be monthly or annual' });
  }

  next();
};

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Username, email and password required' });
  }

  if (typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ msg: 'Username must be a string' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password required' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }

  next();
};

module.exports = {
  validateSubscription,
  validateRegister,
  validateLogin
};
