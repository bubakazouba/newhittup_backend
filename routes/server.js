var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/GetMinVersion', function (req, res, next) {
  res.send({
    "minVersionRequired": "2.1"
  });
});

module.exports = router;