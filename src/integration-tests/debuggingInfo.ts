/**
 * @class DebuggingInfo
 *
 * @description Encapsulates both the error and response that we receive back from superagent.
 *              Used for printing during test failure.
 */
export class DebuggingInfo {
    /**
     * @property {any} response
     * The response object returned back from test execution.
     */
    response: any;

    /**
     * @property {any} errorDetails
     * The error object returned back from test execution.
     */
    errorDetails: any;
}
