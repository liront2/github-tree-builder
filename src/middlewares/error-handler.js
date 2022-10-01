const { AxiosError } = require('axios');
const logger = require('../helpers/logger');

const {
  NOT_FOUND, INTERNAL_SERVER_ERROR,
  GATEWAY_TIMEOUT,
  getStatusText
} = require('http-status-codes');

module.exports = {
  handleRouteNotFoundError,
  handleError
};

function handleError(error, req, res, next) {
  let responseBody, statusCode;
  
  logger.error(error.message);
  if (error instanceof AxiosError) {
    // integration errors with Github
    if (error.response?.status === NOT_FOUND) {
      responseBody = prepareErrorResponse(NOT_FOUND, 'Tree head SHA could not be found');
      statusCode = NOT_FOUND;
    }
    if (!error.response?.status) {
      // when no status code received, it might be a connection issue with github
      responseBody = prepareErrorResponse(GATEWAY_TIMEOUT, getStatusText(GATEWAY_TIMEOUT));
      statusCode = GATEWAY_TIMEOUT;
    }
    // any other issue with Github, when we have a response and a status
    responseBody = prepareErrorResponse(GATEWAY_TIMEOUT, error.response.statusText);
    statusCode = GATEWAY_TIMEOUT;
  } else {
    responseBody = prepareErrorResponse(INTERNAL_SERVER_ERROR, error.message);
    statusCode = INTERNAL_SERVER_ERROR;
  }
  res.status(statusCode);
  return res.json(responseBody);
}

function prepareErrorResponse(
  errCode = INTERNAL_SERVER_ERROR,
  details = getStatusText(INTERNAL_SERVER_ERROR)
) {
  return {
    details,
    error_code: errCode
  };
}

function handleRouteNotFoundError(req, res, next) {
  const responseBody = {
    details: getStatusText(NOT_FOUND),
    error_code: NOT_FOUND
  }
  
  res.status(NOT_FOUND);
  res.json(responseBody);
}
