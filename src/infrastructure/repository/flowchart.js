const axios = require('axios');
const R = require('ramda');

const { Logger } = require('../../util/logger');

class FlowChart {

  constructor() {
    this.baseUrl = "http://localhost:3000/v1";
  }

  /**
   * @typedef AddNodeReturn
   * @property {string} uid
   * @property {string} name
   * @property {number} port
   * @property {number} status_code
   * @property {string[]} tags
   */

  /**
   * 
   * @param {object} nodeData 
   * @param {string} nodeData.name
   * @param {number} nodeData.port
   * @param {string[]} nodeData.tags
   * @param {string[]} nodeData.metadata
   * @returns {Promise<AddNodeReturn>}
   */
  async addNode(nodeData = {}) {
    const node = R.pick(['name', 'port', 'status_code', 'tags', 'metadata'], nodeData);

    try {
      Logger.debug({ node }, 'adding new node');
      const resp = await axios.default.post(
        `${this.baseUrl}/nodes`,
        node,
      );
      Logger.info(
        { node: resp.data },
        'added new node',
      );

      return resp.data;
    } catch (error) {
      const errMessage = 'failed to add new node';
      Logger.error({ error }, errMessage);
      throw new Error(errMessage);
    }
  }

  /**
   * @param {string} uid 
   * @returns {Promise<GetNodeReturn>}
   */
  async getNode(uid) {
    try {
      const resp = await axios.default.get(`${this.baseUrl}/nodes/${uid}`);

      Logger.info({ node: resp.data }, 'found node');
      return resp.data;
    } catch (error) {
      Logger.error({ error, node_uid: uid }, 'failed to get node');
      throw error;
    }
  }

  async listNodes() {
    try {
      const resp = await axios.default.get(`${this.baseUrl}/nodes`);

      Logger.info({ node_quantity: (resp.data || []).length }, 'listed all nodes');
      return resp.data;
    } catch (error) {
      Logger.error({ error }, 'failed to list all nodes');
    }
  }

  /**
   * 
   * @param {object} edgeData 
   * @param {object} edgeData.startNode
   * @param {string?} edgeData.startNode.uid
   * @param {string?} edgeData.startNode.name
   * @param {AddEdgeDestination[]} edgeData.destinations
   * @returns {Promise<AddEdgeReturn>}
   */
  async addEdge(edgeData = {}) {
    const edge = R.pick(
      ['startNode', 'destinations'],
      edgeData,
    );

    try {
      Logger.debug({ edge }, 'adding new edge');
      const resp = await axios.default.post(
        `${this.baseUrl}/edges`,
        edge,
      );

      Logger.info({ edge: resp.data }, 'added new node');
      return resp.data;
    } catch (error) {
      const errMessage = 'failed to add new edge';
      Logger.error({ error }, errMessage);
      throw new Error(errMessage);
    }
  }

  async listAllEdges() {
    try {
      const resp = await axios.default.get(`${this.baseUrl}/edges`);

      Logger.info({ edge_quantity: (resp.data || []).length }, 'listed all edges');
    } catch (error) {
      Logger.error({ error }, 'failed to list all edges');
      throw error;
    }
  }

  /**
   * 
   * @param {string} uid 
   */
  async getEdge(uid) {
    try {
      const resp = await axios.default.get(`${this.baseUrl}/edges/${uid}`);

      Logger.info({ edge: resp.data }, 'found the edge');
      return resp.data;
    } catch (error) {
      Logger.error({ error, edge_uid: uid }, 'failed to get edge');
      throw error;
    }
  }

  async getGraph() {
    try {
      const resp = await axios.default.get(`${this.baseUrl}/graph`);
      Logger.info({ graph: resp.data }, 'got graph');
      return resp.data;
    } catch (error) {
      Logger.error({ error }, 'failed to get graph');
      throw error;
    }
  }
}

/**
 * @typedef AddEdgeDestination
 * @property {object} edgeData.destinations.node
 * @property {string} edgeData.destinations.node.uid
 * @property {object} edgeData.destinations.edgeProperties
 * @property {string} edgeData.destinations.edgeProperties.uid
 * @property {string} edgeData.destinations.edgeProperties.label
 * @property {number} edgeData.destinations.edgeProperties.weight
 * @property {string[]} edgeData.destinations.edgeProperties.tags
 */

/**
 * @typedef AddEdgeReturnDestinations
 * @property {object} node
 * @property {string} node.uid
 * @property {string} node.name
 * @property {object} edge
 * @property {string} edge.uid
 * @property {string} edge.label
 */

/**
 * @typedef AddEdgeReturn
 * @property {object} startNode
 * @property {string} startNode.uid
 * @property {string} startNode.name
 * @property {AddEdgeReturnDestinations[]} destinations
 */

/**
 * @typedef GetNodeReturn
 * @property {string} uid
 * @property {string} name
 * @property {number} port
 * @property {string[]} tags
 * @property {string[]} metadata
 */

module.exports = {
  FlowChart,
};
