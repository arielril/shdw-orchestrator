const { StatusCodes } = require('http-status-codes');
const { Logger } = require('../util/logger');

const errorHandler = (err, req, res, next) => {
  Logger.error(err);

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send({
      name: err.name,
      message: err.message,
    });
};

module.exports = { errorHandler };
