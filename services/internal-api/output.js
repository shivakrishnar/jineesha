/**
 * This function is required by the serverless-stack-output module to write serverless deploy output to JSON file
 */
function handler(data) {
    console.log('Received Stack Output', data);
}

module.exports = { handler };
