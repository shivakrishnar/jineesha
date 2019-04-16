using System;
using System.IO;

using Amazon;
using Amazon.Lambda.Core;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

namespace Encryption
{

    /// <summary>
    /// A general utility class
    /// </summary>
    public class Utils
    {
        /// <summary>
        /// Retrieves a secret from AWS Secrets Manager given the secret name <paramref name="secretName"/> 
        /// </summary>
        /// <returns>
        /// The retrieved secret
        /// </returns>
        /// <exception cref="Amazon.SecretsManager.Model.DecryptionFailureException">Thrown when Secrets Manager can't decrypt the protected secret text using the provided KMS key.</exception>
        /// <exception cref="Amazon.DataPipeline.Model.InternalServiceErrorException">Thrown when an error occurred on the server side on AWS.</exception>
        /// <exception cref="Amazon.SecretsManager.Model.InvalidParameterException">Thrown when provided an invalid value for a parameter.</exception>
        /// <exception cref="Amazon.SecretsManager.Model.InvalidRequestException">Thrown when provided a parameter value that is not valid for the current state of the resource.</exception>
        /// <exception cref="Amazon.SecretsManager.Model.ResourceNotFoundException">Thrown when the given secret cannot be found</exception>
        /// <exception cref="System.AggregateException">Thrown when more than one of the exceptions are triggered</exception>
        /// <param name="secretName"> The name of the secret in AWS Secrets Manager</param>
        public static String GetSecret(String secretName)
        {
            LambdaLogger.Log("Utils.GetSecret");

            var region = Environment.GetEnvironmentVariable("awsRegion");
            string secret = null;

            MemoryStream memoryStream = new MemoryStream();
            IAmazonSecretsManager client = new AmazonSecretsManagerClient(RegionEndpoint.GetBySystemName(region));
            GetSecretValueRequest request = new GetSecretValueRequest();
            request.SecretId = secretName;

            GetSecretValueResponse response = client.GetSecretValueAsync(request).Result;

            // Depending on whether the secret is a string or binary, one of these fields will be populated.
            if (response.SecretString != null)
            {
                secret = response.SecretString;
                return secret;
            }

            // ...if the secret is encoded as a binary
            memoryStream = response.SecretBinary;
            StreamReader reader = new StreamReader(memoryStream);
            string decodedBinarySecret = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(reader.ReadToEnd()));

            return decodedBinarySecret;
        }
    }


}