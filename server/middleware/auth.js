const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const isTestMode = process.env.NODE_ENV === 'test';
  
  if (isTestMode) {
    // In TEST mode, create mock user without token validation
    req.user = { 
      id: '6a351082da1b125a5c4644c3',
      role: 'admin',
      status: 'active'
    };
    return next();
  }

  try {
    const token = req.headers.authorization?.slice(7);
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
