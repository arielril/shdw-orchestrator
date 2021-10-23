const R = require('ramda');
const { Logger } = require('../../util/logger');

const { getInfraContainer } = require('../container');

const actions = {
  NET_SCAN: 'NET_SCAN',
  WEB_PATH_DISCOVERY: 'WEB_PATH_DISCOVERY',
};

class Target {
  /**
   * @type {import('../../infrastructure/repository/flowchart').FlowChart}
   */
  _flowchartRepository;
  /**
   * @type {import('../../infrastructure/repository/code-runner').CodeRunner}
   */
  _codeRunnerRepository;
  _weightRepository;

  constructor() {
    const infraContainer = getInfraContainer();
    this._flowchartRepository = infraContainer.flowchartRepository;
    this._codeRunnerRepository = infraContainer.codeRunnerRepository;
    this._weightRepository = infraContainer.weightRepository;
  }

  /**
   * @param {string} host Target IP or hostname
   * @param {string} comment
   * @returns {Promise<import('../../infrastructure/repository/flowchart').AddNodeReturn>}
   */
  async register(host, comment) {
    const res = await this._flowchartRepository.addNode({
      name: host,
      tags: ['target-host', comment],
    });

    return res;
  }

  /**
   * 
   * @param {string} uid 
   * @returns {Promise<import('../../infrastructure/repository/flowchart').GetNodeReturn>}
   */
  async find(uid) {
    return this._flowchartRepository.getNode(uid);
  }

  /**
   * 
   * @param {string} action 
   * @param {object} target
   * @param {string} target.host
   * @param {string} target.uid
   * @param {NmapOptions | FfufOptions} options 
   * @returns {Promise<import('../../infrastructure/repository/flowchart').AddEdgeReturn>}
   */
  async executeAction(action, target, options = {}) {
    switch (action) {
      case actions.NET_SCAN:
        const nmapResult = await this.executeNmap(target.host, options);
        return this.registerNmapResults(target.uid, nmapResult);
      case actions.WEB_PATH_DISCOVERY:
        const ffufResult = await this.executeFfuf(target.host, options);
        return this.registerFfufResults(target.uid, ffufResult);
      default:
        throw new Error('invalid action');
    }
  }

  /**
   * @param {string} target
   * @param {NmapOptions} options 
   * @returns {Promise<import('../../infrastructure/repository/code-runner').NmapReturn>}
   */
  async executeNmap(target, options = {}) {
    return this._codeRunnerRepository.runNmap({
      target,
      options,
    });
  }

  /**
   * 
   * @param {string} sourceNodeUid
   * @param {import('../../infrastructure/repository/code-runner').NmapReturn} nmapResults 
   * @returns {Promise<import('../../infrastructure/repository/flowchart').AddEdgeReturn>}
   */
  async registerNmapResults(sourceNodeUid, nmapResults = {}) {
    // create all nodes for the nmap result
    const insertedNodes = await Promise.all(
      R.pipe(
        R.propOr([], 'ports'),
        R.map(
          /**
           * @param {import('../../infrastructure/repository/code-runner').NmapReturnPorts} port 
           */
          (port) =>
            this._flowchartRepository.addNode({
              name: port.version || 'undefined',
              port: port.number,
              tags: R.props(['service', 'state', 'protocol'], port),
            })
              .catch((error) => {
                if (error) {
                  Logger.warn(
                    {
                      error,
                      nmap_data: JSON.stringify(port),
                    },
                    'failed to register node with nmap data',
                  );
                }
                throw error;
              })
        )
      )(nmapResults),
    );

    if (!insertedNodes.length) {
      return;
    }

    // create the edges that relate the source node with
    // nmap result nodes
    const destinations = insertedNodes.map(
      /**
       * @returns {import('../../infrastructure/repository/flowchart').AddEdgeDestination}
       */
      async (node) => {
        const edgeWeight = await this._weightRepository
          // TODO add properties here to request weight API
          .compute({})
          .catch(() => 50);

        return {
          node: R.pick(['uid'], node),
          edgeProperties: {
            label: node.port,
            weight: edgeWeight,
          },
        };
      },
    );

    return this._flowchartRepository.addEdge({
      startNode: {
        uid: sourceNodeUid,
      },
      destinations,
    });
  }

  /**
   * @param {string} target 
   * @param {FfufOptions} options 
   * @returns {Promise<import('../../infrastructure/repository/code-runner').FfufReturn>}
   */
  async executeFfuf(target, options = {}) {
    return this._codeRunnerRepository.runFfuf(
      R.assoc('target', target, options),
    );
  }

  /**
   * 
   * @param {string} sourceNodeUid 
   * @param {import('../../infrastructure/repository/code-runner').FfufReturn} ffufResults 
   * @returns {import('../../infrastructure/repository/flowchart').AddEdgeReturn}
   */
  async registerFfufResults(sourceNodeUid, ffufResults) {
    // create the nodes with ffuf result
    const insertedNodes = await Promise.all(
      R.pipe(
        R.propOr([], 'data'),
        R.map(
          /**
           * @param {import('../../infrastructure/repository/code-runner').FfufReturnData} item 
           */
          item => this._flowchartRepository.addNode({
            name: item.path,
            port: item.status_code,
            tags: Object.keys(item.content).map(k => `${k}=${item.content[k]}`),
          })
            .catch((error) => {
              if (error) {
                Logger.warn(
                  {
                    error,
                    ffuf_item: JSON.stringify(item),
                  },
                  'failed to insert ffuf item into a node',
                );
              }
              throw error;
            })
        )
      )(ffufResults),
    );

    // for each ffuf result node, add an edge starting from the 
    // source node to the ffuf result node
    const destinations = insertedNodes.map(
      /**
       * @returns {import('../../infrastructure/repository/flowchart').AddEdgeDestination}
       */
      async (node) => {
        const edgeWeight = await this._weightRepository
          // TODO add properties here to request weight API
          .compute({})
          .catch(() => 50);

        return {
          node: R.pick(['uid'], node),
          edgeProperties: {
            label: node.name,
            // todo: request to weight API to get the value
            weight: edgeWeight,
            tags: node.tags,
          }
        };
      },
    );

    return this._flowchartRepository.addEdge({
      startNode: {
        uid: sourceNodeUid,
      },
      destinations,
    });
  }
}

/**
 * @typedef NmapOptions
 * @property {boolean} service_version
 * @property {boolean} hosts_online
 * @property {string} port_range
 * @property {boolean} default_scripts
 * @property {boolean} syn_scan
 * @property {boolean} udp_scan
 */

/**
 * @typedef FfufOptions
 * @property {boolean} recursion
 * @property {boolean} redirect
 * @property {number[]} ignore_status
 */

module.exports = { Target };
