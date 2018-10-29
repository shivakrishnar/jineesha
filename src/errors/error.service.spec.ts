import * as errorService from './error.service';
import { ErrorMessage } from './errorMessage';

describe('ErrorService ', () => {
  test('returns valid message for known code', () => {
    const errorMessage = errorService.getErrorResponse(10);
    expect(errorMessage).toBeInstanceOf(ErrorMessage);
    expect(errorMessage.code).toBe(10);
  });

  test('when code does not exist should return code 0', () => {
    const errorMessagex = errorService.getErrorResponse(-999);
    expect(errorMessagex).toBeInstanceOf(ErrorMessage);
    expect(errorMessagex.code).toBe(0);
    expect(errorMessagex.statusCode).toBe(500);
  });
});

describe('ErrorMessage ', () => {
  let errorMessage: ErrorMessage;
  const testString = 'xxxxx';

  beforeEach(() => {
    errorMessage = errorService.getErrorResponse(10);
  });

  test('setMessage sets the message property', () => {
    errorMessage.setMessage(testString);
    expect(errorMessage.message).toBe(testString);
  });

  test('setDeveloperMessage sets the developer message property', () => {
    errorMessage.setDeveloperMessage(testString);
    expect(errorMessage.developerMessage).toBe(testString);
  });

  test('setMoreInfo sets the more info property', () => {
    errorMessage.setMoreInfo(testString);
    expect(errorMessage.moreInfo).toBe(testString);
  });

  test('addResourceDetails correctly replaces placeholder', () => {
    errorMessage.addResourceDetails(testString);
    expect(errorMessage.message).toContain(testString);
    expect(errorMessage.developerMessage).toContain(testString);
  });
});
