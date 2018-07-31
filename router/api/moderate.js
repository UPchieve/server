const ModerationCtrl = require('../../controllers/ModerationCtrl');

module.exports = (router) => {

  router.route('/moderate/message').post((req, res) => {
    ModerationCtrl.moderateMessage(req.body, (err, isClean) => {
      if (err) {
        console.log(err);
        res.json({ 'err': err });
      }
      else {
        res.json({ 'isClean': isClean });
      }
    });
  });
}