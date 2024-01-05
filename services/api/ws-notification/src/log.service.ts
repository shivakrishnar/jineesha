import * as AWS from 'aws-sdk';
import * as configService from '../../../config.service';

export async function createLogStream(executionName: string): Promise<void> {
	console.info('log.service.createLogStream');
  try {
    const cloudwatch = new AWS.CloudWatchLogs({
      region: configService.getAwsRegion(),
    });
    await cloudwatch.createLogStream({
      logGroupName: 'HrCompanyMigrator-Logs',
      logStreamName: executionName,
    }).promise();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getSequenceToken(executionName: string): Promise<string> {
	console.info('log.service.getSequenceToken');
  try {
    const cloudwatch = new AWS.CloudWatchLogs({
      region: configService.getAwsRegion(),
    });
    const { logStreams } = await cloudwatch.describeLogStreams({
      logGroupName: 'HrCompanyMigrator-Logs',
      logStreamNamePrefix: executionName,
      // logStreamName: executionName,
    }).promise();
    return logStreams[0].uploadSequenceToken;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function log(executionName: string, message: string, sequenceToken?: string): Promise<string> {
  try {
    const cloudwatch = new AWS.CloudWatchLogs({
      region: configService.getAwsRegion(),
    });
    const response = await cloudwatch.putLogEvents({
      logEvents: [
        {
          message,
          timestamp: Date.now(),
        },
      ],
      logGroupName: 'HrCompanyMigrator-Logs',
      logStreamName: executionName,
      sequenceToken,
    }).promise();
    console.log(response.nextSequenceToken);
    return response.nextSequenceToken;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getLogs(executionName: string): Promise<any[]> {
  console.info('log.service.getLogs');
  try {
    const cloudwatch = new AWS.CloudWatchLogs({
      region: configService.getAwsRegion(),
    });
    const response = await cloudwatch.getLogEvents({
      logGroupName: 'HrCompanyMigrator-Logs',
      logStreamName: executionName,
    }).promise();
    return response.events;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
