const axios = require('axios');

const { Logger } = require('../../util/logger');

class CodeRunner {
  constructor() {
    this.baseUrl = 'http://localhost:5000/v1';
  }

  /**
   * 
   * @param {object} opts 
   * @param {string} opts.target 
   * @param {object} opts.options
   * @param {boolean} opts.options.service_version
   * @param {boolean} opts.options.hosts_online
   * @param {string} opts.options.port_range
   * @param {boolean} opts.options.default_scripts
   * @param {boolean} opts.options.syn_scan
   * @param {boolean} opts.options.udp_scan
   * @param {boolean} opts.options.verbose
   */
  async runNmap(opts = {}) {
    try {
      const resp = await axios.default.post(
        `${this.baseUrl}/nmap`,
        opts,
      );

      Logger.info(resp.data, 'ran nmap');
      return resp.data;
    } catch (error) {
      Logger.error();
      throw error;
    }
  }

  /**
   * 
   * @param {object} opts 
   * @param {string} opts.target
   * @param {boolean} opts.recursion
   * @param {boolean} opts.redirect
   * @param {number[]} opts.ignore_status
   */
  async runFfuf(opts = {}) {
    try {
      const resp = await axios.default.post(
        `${this.baseUrl}/ffuf`,
        opts,
      );

      Logger.info(resp.data, 'ran ffuf');
      return resp.data;
    } catch (error) {
      Logger.error({ error }, 'failed to run ffuf');
      throw error;
    }
  }
}

module.exports = { CodeRunner };
