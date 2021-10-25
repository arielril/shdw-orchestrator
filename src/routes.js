const Target = require('./core/controller/target')

class Routes {
  /**
   * @param {import('express').IRouter} router 
   */
  constructor(router) {
    this._router = router;
  }

  registerRoutes() {
    this._router.post('/v1/targets/register', Target.register);
    this._router.put('/v1/targets/:uid', Target.executeAction);
  }
}

module.exports = { Routes };
