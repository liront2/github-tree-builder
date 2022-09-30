const { AxiosError } = require('axios');

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
