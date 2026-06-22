const Transaction = require('../models/Transaction');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }
    if (typeof message !== 'string' || message.length === 0 || message.length > 1000) {
      return res.status(400).json({ success: false, message: 'message must be a string between 1-1000 characters' });
    }

    // Mock AI response based on message
    const mockReply = `Based on your question about "${message}", here are some financial insights...`;

    res.json({ success: true, reply: mockReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
