/**
 *  Represents a mock result from an AWS API call.
 */

export enum MockAwsResultPromiseResolution {
    RESOLVED,
    REJECTED,
}

export class MockAwsResult {
    result: any;
    state: MockAwsResultPromiseResolution;

    constructor(state: MockAwsResultPromiseResolution, result: any) {
        this.result = result;
        this.state = state;
    }

    promise(): Promise<any> {
        switch (this.state) {
            case MockAwsResultPromiseResolution.REJECTED:
                return Promise.reject(this.result);

            case MockAwsResultPromiseResolution.RESOLVED:
                return Promise.resolve(this.result);

            default:
                return Promise.reject({
                    message: 'Unknown promise state',
                    state: this.state,
                });
        }
    }
}
