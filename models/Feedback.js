var mongoose = require('mongoose');

var feedbackSchema = new mongoose.Schema({

  sessionId: {
    type: String,
    default: ''
  },

  responseData: {
    type: Object,
    default: ''
  }
  
});

module.exports = mongoose.model('Feedback', feedbackSchema);
