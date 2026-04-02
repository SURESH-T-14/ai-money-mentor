const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ROLES = ['viewer', 'analyst', 'admin'];
const STATUSES = ['active', 'inactive'];

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt
  };
}

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.json(sanitizeUser(user));
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users.map(sanitizeUser));
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, status } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'name, email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ msg: 'Invalid role' });
  }

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'viewer',
      status: status || 'active'
    });

    return res.status(201).json(sanitizeUser(user));
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { name, role, status, password } = req.body;

  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ msg: 'Invalid role' });
  }

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (status !== undefined) {
      user.status = status;
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    return res.json(sanitizeUser(user));
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};
