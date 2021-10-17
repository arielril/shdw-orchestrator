const express = require('express');
const { StatusCodes: httpStatus } = require('http-status-codes');

const { Routes } = require('./routes');
const { Logger } = require('./util/logger');
const { ExpressLogger } = require('./middleware/expressLogger');
const { errorHandler } = require('./middleware/errorHandler');

const expressLogger = new ExpressLogger(Logger);

const app = express();
app.use(
  express.json({ limit: '500kb' }),
  expressLogger.onSuccess.bind(expressLogger),
  expressLogger.onError.bind(expressLogger),
);

const router = new Routes(app);
router.registerRoutes();

// 404 handler
app.use('*', (req, res, next) => {
  return res.status(httpStatus.NOT_FOUND)
    .json({
      message: 'page not found',
    });
});

app.use(errorHandler);

setImmediate(() => {
  const listenPort = 3001;
  app.listen(listenPort);
  Logger.info({ http_port: listenPort }, 'http server is listening');
});
