const R = require('ramda');
const { StatusCodes } = require('http-status-codes');

const { Logger } = require('../../util/logger');
const { Target } = require('../services/target');

const targetService = new Target();

/**
* 
* @param {import('express').Request} req 
* @param {import('express').Response} res 
* @param {import('express').NextFunction} next 
*/
const register = async (req, res, next) => {
  try {
    const data = R.pick(['host', 'comment'], req.body || {});

    const registeredNode = await targetService.register(data.host, data.comment);

    return res
      .status(StatusCodes.CREATED)
      .json(R.pick(['uid', 'host'], registeredNode));
  } catch (error) {
    Logger.error({ error }, 'failed to register target');
    next(error);
  }
};

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
const executeAction = async (req, res, next) => {
  try {
    const targetUid = R.path(['params', 'uid'], req);

    if (!targetUid) {
      return res.status(StatusCodes.BAD_REQUEST)
        .json({
          message: 'invalid target UID',
        });
    }

    const targetNode = await targetService.find(targetUid);

    const action = R.path(['body', 'action'], req);
    const options = R.path(['body', 'options'], req);

    const result = await targetService.executeAction(
      action,
      {
        host: targetNode.name,
        uid: targetNode.uid,
      },
      options,
    );


    return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  executeAction,
  register,
};
