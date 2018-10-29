/**
 * @class ErrorMessage
 *
 * @description
 *
 * Encapsulates an ErrorMessage resource.
 *
 * @author swallace
 */
export class ErrorMessage {
  /**
   * @property {Number} statusCode
   * The HTTP status code of the error response.
   */
  statusCode: number;

  /**
   * @property {Number} code
   * Internal iSystems error code which can provide additional information for
   * debugging an issue.
   */
  code: number;

  /**
   * @property {String} message
   * Human readable error message that can be dispalyed to an end user.
   */
  message: string;

  /**
   * @property {String} developerMessage
   * Error message that can provide more details and is aimed at developers.
   */
  developerMessage: string;

  /**
   * @property {String} [moreInfo]
   * Field that can provide more information about the error.
   */
  moreInfo: string;

  /**
   * @property {String} requestId
   * Unique id of the request that can be used to track an API call through the system.
   */
  requestId: string;

  public constructor(init: ErrorMessage) {
    Object.assign(this, init);
  }

  /**
   * Allows us to override the message that is returned as part of the error.
   */
  setMessage(value: string): ErrorMessage {
    this.message = value;
    return this;
  }

  /**
   * Allows us to override the developer message with code level details.
   */
  setDeveloperMessage(value: string): ErrorMessage {
    this.developerMessage = value;
    return this;
  }

  /**
   * Allows us to enahnce the error message with specific details that may
   * be useful to the user.
   */
  setMoreInfo(value: string): ErrorMessage {
    this.moreInfo = value;
    return this;
  }

  /**
   * Error messages can be written to be dynamically enhanced with data like
   * field or property names that are invalid.
   */
  addResourceDetails(field: string): ErrorMessage {
    this.message = this.message.replace('{$}', field);
    this.developerMessage = this.developerMessage.replace('{$}', field);
    return this;
  }
}
