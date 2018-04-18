/**
 * Import required packages.
 * Set-up and run the Express app.
 */
const express = require('express');
const app = express();

var bodyParser = require('body-parser');

/**
 * Import app routes
 */
var sleep = require('./routes/sleep.js');

/**
 *  CORS Cross-Origin Resource Sharing
 */
app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  next();
});

// Use middleware which serves files from given 'public' directory
app.use(express.static('./public'));

// Use body-parsing middleware for JSON like experience with URL-encoded
// Extended syntax uses qs library (when true) and querystring library (when false)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.all(function(error, req, res, next) {
  // Catch bodyParser error
  if (error.message === 'invalid json') {
    res
      .status(400)
      .send({ error: '400 <br>Wrongly formated <code>json</code> was sent' });
  } else {
    next();
  }
});

// For specified path use required modules
app.use('/api/sleep/', sleep);

app.listen(process.env.PORT || 5000);
