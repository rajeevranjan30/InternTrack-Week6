const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/token');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'name, email and password are required' });
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'name, email and password must be strings' });
    }
    if (password.length < 8) return res.status(400).json({ success: false, message: 'password must contain at least 8 characters' });

    const normalizedEmail = email.toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: 'Email is already registered' });

    // Public registration never accepts a client-supplied admin/mentor role.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      role: 'intern'
    });
    res.status(201).json({
      success: true, message: 'User registered successfully',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token: signToken(user) }
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    res.json({
      success: true, message: 'Login successful',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token: signToken(user) }
    });
  } catch (err) { next(err); }
};
