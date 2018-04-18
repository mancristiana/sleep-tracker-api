var express = require('express');

// Create a router object from the top level express object for performing middleware and routing functions.
var router = express.Router();

// Good practice to use route method to avoid duplicate route naming and thus typo errors
router
  .route('/')

  // Handler function (middleware system) for get request
  .get(function(req, res) {
    res.status(200);
    res.json({ text: 'Data' });
  });

module.exports = router;
