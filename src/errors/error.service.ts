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

export function notAuthenticated(): ErrorMessage {
    return findErrorMessage(10);
}

export function notAuthorized(role: string): ErrorMessage {
    const errorMessage = findErrorMessage(20);
    errorMessage.setDeveloperMessage(`The principal does not have the required role (${role}).`);
    return errorMessage;
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
        return d.code === code;
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
      "message": "Unexpected error occurred.",
      "developerMessage": "Something happened on the server and we have no idea what. Blame the architect.",
      "moreInfo": ""
    },
    {
      "statusCode": 401,
      "code": 10,
      "message": "User is not authenticated",
      "developerMessage": "The provided token was invalid or expired, so the user is not authenticated to perform this action.",
      "moreInfo": ""
    },
    {
      "statusCode": 401,
      "code": 11,
      "message": "User is not authorized.",
      "developerMessage": "The user does not have authorization to use this endpoint.",
      "moreInfo": ""
    },
    {
      "statusCode": 403,
      "code": 20,
      "message": "Not authorized.",
      "developerMessage": "",
      "moreInfo": ""
    },
    {
      "statusCode": 400,
      "code": 30,
      "message": "The provided request object was not valid for the requested operation.",
      "developerMessage": "",
      "moreInfo": ""
    },
    {
      "statusCode": 409,
      "code": 40,
      "message": "Conflict. The provided request object already exists.",
      "developerMessage": "There are already records in the database with the same provided information.",
      "moreInfo": ""
    },
    {
      "statusCode": 404,
      "code": 50,
      "message": "The requested resource does not exist.",
      "developerMessage": "",
      "moreInfo": ""
    }
  ]`);
}
