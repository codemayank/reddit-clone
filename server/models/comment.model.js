const mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
  description: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: new Date().getTime() }
});

module.exports = mongoose.model('Comment', commentSchema);
