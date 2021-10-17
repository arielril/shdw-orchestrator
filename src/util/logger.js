const bunyan = require('bunyan');

function logger(config) {
  return bunyan.createLogger({
    name: config.PROJECT_NAME,
    level: config.LOG_LEVEL || 'debug',
    streams: config.STREAMS,
  });
}

module.exports = {
  Logger: logger({
    PROJECT_NAME: 'flowchart-api',
  }),
};
