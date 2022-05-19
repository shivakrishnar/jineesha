export const awsMockMethods = {
	dynamodb: {},
	sns: {},
};

export function mockSdkMethod(serviceName, methodName, mock) {
    awsMockMethods[serviceName][methodName] = mock
}

export const catchMethod = () => {
    console.log('catch');
};

export const promiseResult = () => ({
	promise: () => { return },
});

export const dynamoResult = (Items) => ({
	promise: () => {
		return {
			catch: catchMethod,
			Items,
		}
	}
});