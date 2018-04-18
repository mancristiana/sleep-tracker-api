module.exports = {
  errorHandler: function(res, err) {
    if (err) {
      console.log('ERR', err);
      res.status(500).send({
        error: 'Internal Server Error',
        message: err
      });
      return true;
    }
    return false;
  }
};
