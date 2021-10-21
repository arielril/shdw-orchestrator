const axios = require('axios');
const R = require('ramda');

const { Logger } = require('../../util/logger');

class FlowChart {

  constructor() {
    this.baseUrl = "http://localhost:3000/v1";
  }

  /**
   * 
   * @param {object} nodeData 
   * @param {string} nodeData.name
   * @param {number} nodeData.port
   * @param {string[]} nodeData.tags
   * @param {string[]} nodeData.metadata
   */
  async addNode(nodeData = {}) {
    const node = R.pick(['name', 'port', 'tags', 'metadata'], nodeData);

    try {
      Logger.debug(node, 'adding new node');
      const resp = await axios.default.post(
        `${this.baseUrl}/nodes`,
        node,
      );
      Logger.info(
        resp.data,
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
   * 
   * @param {string} uid 
   */
  async getNode(uid) {
    try {
      const resp = await axios.default.get(`${this.baseUrl}/nodes/${uid}`);

      Logger.info(resp.data, 'found node');
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
   * @param {object[]} edgeData.destinations
   * @param {object} edgeData.destinations.node
   * @param {string} edgeData.destinations.node.uid
   * @param {object} edgeData.destinations.edgeProperties
   * @param {string} edgeData.destinations.edgeProperties.uid
   * @param {string} edgeData.destinations.edgeProperties.label
   * @param {number} edgeData.destinations.edgeProperties.weight
   * @param {string[]} edgeData.destinations.edgeProperties.tags
   */
  addEdge(edgeData = {}) {
    const edge = R.pick(
      ['startNode', 'destinations'],
      edgeData,
    );

    try {
      Logger.debug(edge, 'adding new edge');
      const resp = await axios.default.post(
        `${this.baseUrl}/edges`,
        edge,
      );

      Logger.info(resp.data, 'added new node');
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

      Logger.info(resp.data, 'found the edge');
      return resp.data;
    } catch (error) {
      Logger.error({ error }, 'failed to get edge');
      throw error;
    }
  }
}

module.exports = { FlowChart };
