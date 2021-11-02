const { StatusCodes } = require('http-status-codes');
const Graph = require('../services/graph');

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
const getGraph = async (req, res, next) => {
  try {
    const graphService = new Graph();

    const graph = await graphService.get();

    return res.status(StatusCodes.OK).json(graph);
  } catch (error) {
    next(error);
  }
};

module.exports = { getGraph };
