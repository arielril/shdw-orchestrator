const cors = require('cors');

const Target = require('./core/controller/target');
const Graph = require('./core/controller/graph');

class Routes {
  /**
   * @param {import('express').IRouter} router 
   */
  constructor(router) {
    this._router = router;
  }

  registerRoutes() {
    this._router.use(cors());

    this._router.post('/v1/targets/register', Target.register);
    this._router.put('/v1/targets/:uid', Target.executeAction);

    this._router.get('/v1/graph', Graph.getGraph);
  }
}

module.exports = { Routes };
