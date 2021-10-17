class Routes {
  /**
   * @param {import('express').IRouter} router 
   */
  constructor(router) {
    this._router = router;
  }

  registerRoutes() {
    this._router.get('/v1/', (req, res) => {
      return res.status(200).json({ suup: true });
    });
  }
}

module.exports = { Routes };
