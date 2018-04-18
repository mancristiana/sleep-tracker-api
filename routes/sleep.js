var express = require('express');

// Create a router object from the top level express object for performing middleware and routing functions.
var router = express.Router();

// Require mongodb module
var MongoClient = require('mongodb').MongoClient; // instance needed for connecting to db
var ObjectID = require('mongodb').ObjectID;

// Connection URL
var url = process.env.MONGODB_URI;
var db = process.env.MONGODB_DB;

var errorHandler = require('./../utils/error-handler').errorHandler;

// Good practice to use route method to avoid duplicate route naming and thus typo errors
router
  .route('/')
  /**
   * @api {get} /sleep Get All Sleep
   * @apiName get-all-sleep
   * @apiGroup Sleep
   * @apiVersion 1.0.0
   *
   * @apiDescription This request returns a list of all sleep.
   *
   * @apiSuccess (Sleep Fields) {String} _id Unique Mongo generated id of the sleep.
   * @apiSuccess (Sleep Fields) {String} date Date (yyyy-mm-dd) of the sleep.
   * @apiSuccess (Sleep Fields) {String} bedTime Time (hh:mm) of the sleep.
   * @apiSuccess (Sleep Fields) {number} interval Time measured in hours of sleep.
   * @apiSuccess (Sleep Fields) {String} type We can specify what kind of sleep it was. For now, we should support one of ["restless", "normal"].
   *
   * @apiSuccessExample {json} Success-Response:
   *   HTTP/1.1 200 OK
   *   [
   *       {
   *           "_id": "573ec098e85f5601f611322b",
   *           "date": "2018-04-02",
   *           "bedTime": "21:30",
   *           "interval": 9,
   *           "type": "normal"
   *       }
   *   ]
   *
   * @apiError (Error 5xx) 500 Internal Server Error
   *
   */

  // Handler function (middleware system) for get request
  .get(function(req, res) {
    MongoClient.connect(url, function(err, client) {
      if (errorHandler(res, err)) return;
      var db = client.db(db);
      var collection = db.collection('sleep');
      collection.find().toArray(function(err, result) {
        if (errorHandler(res, err)) return;
        res.status(200);
        res.json(result);

        client.close();
      });
    });
  })

  /**
   * @api {post} /sleep Add Sleep
   * @apiName add-sleep
   * @apiGroup Sleep
   * @apiVersion 1.0.0
   *
   * @apiDescription This request creates a new sleep using the json body provided. An _id field is generated automatically. For consistency the json should include the parameters specified below. A return Json prividing the generated _id is returned
   *
   *
   * @apiParam (Requested Fields) {String} date Date (yyyy-mm-dd) of the sleep.
   * @apiParam (Requested Fields) {String} bedTime Time (hh:mm) of the sleep.
   * @apiParam (Requested Fields) {number} interval Time measured in hours of sleep.
   * @apiParam (Requested Fields) {String} type We can specify what kind of sleep it was. For now, we should support one of ["restless", "normal"].
   *
   * @apiParamExample {json} Post Example:
   *   {
   *       "date": "2018-04-02",
   *       "bedTime": "21:30",
   *       "interval": 9,
   *       "type": "normal"
   *   }
   *
   * @apiSuccess (Success 2xx) 201 Sleep Created
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 201 Created
   *     Location : /<ObjectId>
   *     {
   *       "_id" : "5746d36bfa2cdf7c300bf61c",
   *       "message": "Sleep added"
   *     }
   *
   * @apiError (Error 4xx) 400 Bad Request <br>Wrongly formated <code>json</code> was sent.
   * @apiError (Error 5xx) 500 Internal Server Error
   * @apiErrorExample {json} Error-Response:
   *   HTTP/1.1 500 Internal Server Error
   *   {
   *       "error": "Internal Server Error"
   *   }
   *
   */

  .post(function(req, res) {
    MongoClient.connect(url, function(err, client) {
      if (errorHandler(res, err)) return;
      var db = client.db(db);
      var collection = db.collection('sleep');
      collection.insertOne(req.body, function(err, result) {
        if (errorHandler(res, err)) return;
        res.status(201);
        res.location('/' + result.insertedId.toHexString());
        res.json({
          _id: result.insertedId.toHexString(),
          message: 'Sleep added'
        });

        client.close();
      });
    });
  });

router
  .route('/:id')

  /**
   * @api {get} /sleep/id Get Sleep
   * @apiName get-sleep
   * @apiGroup Sleep
   * @apiVersion 1.0.0
   *
   * @apiDescription This request returns the sleep specified by the unique ID in the request URL
   *
   * @apiParam {ObjectId} id The unique identifier of the sleep.
   *
   * @apiSuccess (Success 2xx) 200 OK
   * @apiSuccessExample {json} Success-Response:
   *   HTTP/1.1 200 OK
   *   {
   *       "_id": "573ec098e85f5601f611322b",
   *       "date": "2018-04-02",
   *       "bedTime": "21:30",
   *       "interval": 9,
   *       "type": "normal"
   *   }
   *
   * @apiError 404 Sleep Not Found
   * @apiError 400 Bad Request <br>Wrongly formated <code>id</code> was sent.
   * @apiError (Error 5xx) 500 Internal Server Error
   *
   */

  .get(function(req, res) {
    MongoClient.connect(url, function(err, client) {
      if (errorHandler(res, err)) return;
      var db = client.db(db);
      var collection = db.collection('sleep');
      try {
        collection.findOne({ _id: ObjectID(req.params.id) }, function(
          err,
          result
        ) {
          if (errorHandler(res, err)) return;
          if (result === null) {
            res.status(404).send({ error: 'Exercise Not Found' });
          } else {
            res.status(200);
            res.json(result);
          }
          client.close();
        });
      } catch (e) {
        res.status(400).send({ error: 'Bad Request' });
        client.close();
      }
    });
  })

  /**
   * @api {put} /sleep/id Update Sleep
   * @apiName update-sleep
   * @apiGroup Sleep
   * @apiVersion 1.0.0
   *
   * @apiDescription This request updates an existing sleep using the json body provided and the _id parameter specified in the request URL. For consistency the json may include keys like in the example below.
   *
   * @apiParam {ObjectId} id The unique identifier of the sleep.
   * @apiParamExample {json} Edit Example:
   *   {
   *       "bedTime": "22:00",
   *       "interval": 7,
   *   }
   *
   * @apiSuccess (Success 2xx) 201 Sleep Edited
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 201 Created
   *     Location : /api/sleep/<ObjectId>
   *     {
   *       "message": "Sleep edited"
   *     }
   *
   * @apiError (Error 4xx) 404 Sleep not Found
   * @apiError (Error 4xx) 400 Bad Request <br>Wrongly formated <code>json</code> was sent.
   * @apiError (Error 5xx) 500 Internal Server Error
   *
   */
  .put(function(req, res) {
    MongoClient.connect(url, function(err, client) {
      if (errorHandler(res, err)) return;
      var db = client.db(db);
      var collection = db.collection('sleep');

      try {
        collection.update(
          { _id: ObjectID(req.params.id) },
          { $set: req.body },
          function(err, result) {
            if (errorHandler(res, err)) return;
            res.status(201).send({ message: 'Sleep edited' });
            client.close();
          }
        );
      } catch (e) {
        res.status(400).send({ error: 'Bad Request' });
        client.close();
      }
    });
  })

  /**
   * @api {delete} /sleep/id Delete Sleep
   * @apiName delete-sleep
   * @apiGroup Sleep
   * @apiVersion 1.0.0
   *
   * @apiDescription This request deletes an existing sleep with the _id parameter specified in the request URL.
   * @apiParam {ObjectId} id The unique identifier of the sleep.
   *
   * @apiSuccess (Success 2xx) 200 Successful Request
   *
   * @apiSuccessExample {json} Success-Response:
   *      HTTP/1.1 204 No Content
   *      {
   *          "message" : "Sleep deleted"
   *      }
   *
   * @apiError 404 Sleep Not Found
   * @apiError 400 Bad Request <br>A wrong formated <code>id</code> was sent
   *
   * @apiError (Error 5xx) 500 Internal Server Error
   *
   */
  .delete(function(req, res) {
    MongoClient.connect(url, function(err, client) {
      if (errorHandler(res, err)) return;
      var db = client.db(db);
      var collection = db.collection('sleep');

      try {
        collection.remove({ _id: ObjectID(req.params.id) }, function(
          err,
          result
        ) {
          if (errorHandler(res, err)) return;
          res.status(200);
          res.json({
            _id: req.params.id,
            message: 'Sleep deleted'
          });

          client.close();
        });
      } catch (e) {
        res.status(400).send({ error: 'Bad Request' });
        client.close();
      }
    });
  });

module.exports = router;
