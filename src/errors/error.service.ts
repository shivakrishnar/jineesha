import { ErrorMessage } from './errorMessage';

/**
 * Returns a properly formatted ErrorMessage object with messaging for the
 * code that was requested. If no matching code is found it will default to the
 * messaging for a 500 error.
 *
 * @param {number} code
 */
export function getErrorResponse(code: number): ErrorMessage {
  return findErrorMessage(code);
}

/**
 * Private function which locates an error message based on the code that is
 * passed in. If a message with the code is not found then the default message
 * with an status code of 500 is returned.
 *
 * @param {number} code
 */
function findErrorMessage(code: number): ErrorMessage {
  let message = errorMessages().find((d) => {
    if (d.code === code) {
      return true;
    } else {
      return false;
    }
  });

  if (message === undefined) {
    message = findErrorMessage(0);
  }

  return new ErrorMessage(message as ErrorMessage);
}

function errorMessages(): ErrorMessage[] {
  return JSON.parse(`[
    {
      "statusCode": 500,
      "code": 0,
      "message": "Unexpected error occured.",
      "developerMessage": "Something happened on the server and we have no idea what. Blame the architect.",
      "moreInfo": ""
    }
  ]`);
}
