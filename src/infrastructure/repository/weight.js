const axios = require('axios');
const R = require('ramda');

const { Logger } = require('../../util/logger');

class Weight {
  constructor() {
    this.baseUrl = 'http://localhost:6000/v1';
  }

  /**
   * 
   * @param {object} data 
   * @param {object} data.source
   * @param {string} data.source.id
   * @param {object} data.destination
   * @param {string} data.destination.id
   * @param {object[]} data.edges
   * @param {string} data.edges.id
   * @returns {Promise<ComputeReturn>}
   */
  async compute(data = {}) {
    const computeData = R.pick(['source', 'destination', 'edges'], data);

    try {
      const resp = await axios.default.post(
        `${this.baseUrl}/compute`,
        computeData,
      );

      Logger.info(resp.data, 'computed the weight ');
      return resp.data;
    } catch (error) {
      Logger.error({ error }, 'failed to compute weight');
      throw error;
    }
  }
}

/**
 * @typedef ComputeReturn
 * @property {number} result
 */



module.exports = { Weight };
