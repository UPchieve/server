var Feedback = require('../../models/Feedback');

module.exports = function(router){
  router.post('/feedback', function(req, res){
    var body = req.body;
    console.log(body['responseData']);
    var feedback = new Feedback({
      sessionId: body['sessionId'],
      responseData: body['responseData']
    });
    console.log(feedback);
    feedback.saveData(function(err, session){
      if (err){
        console.log(err);
        res.json({
          err: err
        });
      } else {
        res.json({
          sessionId: session._id
        });
      }
    });
  });
};
