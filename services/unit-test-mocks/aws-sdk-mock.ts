export const awsMockMethods = {
	dynamodb: {},
};

export function mockSdkMethod(serviceName, methodName, mock) {
    awsMockMethods[serviceName][methodName] = mock
}

export const catchMethod = () => {
    console.log('catch');
};

export const dynamoResult = (Items) => ({
	promise: () => {
		return {
			catch: catchMethod,
			Items,
		}
	}
});