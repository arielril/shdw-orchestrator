const { getInfraContainer } = require('../container');

class Graph {
  /**
   * @type {import('../../infrastructure/repository/flowchart').FlowChart}
   */
  _flowchartRepository;

  constructor() {
    const infraContainer = getInfraContainer();
    this._flowchartRepository = infraContainer.flowchartRepository;
  }

  async get() {
    return this._flowchartRepository.getGraph();
  }
}

module.exports = { Graph };
