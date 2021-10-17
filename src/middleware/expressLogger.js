const { v4: uuid } = require('uuid');
const R = require('ramda');

class ExpressLogger {
  constructor(logger) {
    this._logger = logger;
  }

  onSuccess(req, res, next) {
    const localLogger = this._logger;

    const end = res.end;
    const requestId = uuid();

    {
      const pickReq = ['url', 'method', 'httpVersion', 'ip', 'headers', 'body'];
      const baseData = {
        requestId,
        type: 'Request',
      };

      const __data__ = R.pipe(
        R.pick(pickReq),
        R.mergeDeepLeft(baseData),
      )(req);
      localLogger.debug(__data__);
    }

    res.end = function _end(chunk, encode) {
      res.end = end;
      res.end(chunk, encode);

      const headers = res.getHeaders();
      let rawBody = String(chunk);

      let remote = req.ip;
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }

      const msg = R.ifElse(
        R.hasPath(['body', 'message']),
        R.path(['body', 'message']),
        R.prop('statusMessage'),
      )(res);

      localLogger.info({
        request_id: requestId,
        method: R.prop('method', req),
        path: R.prop('url', req),
        latency: R.prop('x-request-time', headers),
        status_code: R.prop('statusCode', res),
      });
    };

    next();
  }

  onError(error, req, res, next) {
    this.onSuccess.bind(this, req, res, next.bind(null, error));
  }
}

module.exports = { ExpressLogger };
