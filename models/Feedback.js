var mongoose = require('mongoose');

var feedbackSchema = new mongoose.Schema({
  // student: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Session'
  // },

  sessionId: {
    type: String,
    default: ''
  },

  responseData: {
    type: Object,
    default: ''
  }

  // Scheduled sessions
  // startAt: {
  //   type: Date,
  //   default: Date.now
  // }

});

feedbackSchema.methods.saveData = function(cb){
  console.log('saving...');
  this.save(cb);
};

module.exports = mongoose.model('Feedback', feedbackSchema);
