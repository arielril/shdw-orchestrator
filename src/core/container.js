const { CodeRunner } = require('../infrastructure/repository/code-runner');
const { FlowChart } = require('../infrastructure/repository/flowchart');
const { Weight } = require('../infrastructure/repository/weight');

/**
 * @typedef InfraContainer
 * @property {import('../infrastructure/repository/code-runner').CodeRunner} codeRunnerRepository
 * @property {import('../infrastructure/repository/flowchart').FlowChart} flowchartRepository
 * @property {import('../infrastructure/repository/weight').Weight} weightRepository
 */

/**
 * @returns {InfraContainer}
 */
const getInfraContainer = () => {
  return {
    codeRunnerRepository: new CodeRunner(),
    flowchartRepository: new FlowChart(),
    weightRepository: new Weight(),
  };
};

module.exports = {
  getInfraContainer,
};
