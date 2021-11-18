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
    const graph = await this._flowchartRepository.getGraph();

    const nodes = graph.nodes.map((nd) => ({
      ...nd,
      id: nd.uid,
    }));

    return {
      nodes,
      links: graph.edges,
    };
  }
}

module.exports = { Graph };
