
using System;
using System.Net;

using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;


[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]

namespace Encryption
{
    /// <summary>
    /// The main entry point for the Lambda
    /// </summary>
    public class Handler
    {
        /// <summary>
        /// Decrypts a given ciphertext
        /// </summary>
        /// <returns>
        /// A response containing the plaintext representation of the ciphertext
        /// </returns>
        /// <param name="request"> The the decryption request event payload</param>
        /// <param name="context"> The Lambda invocation context</param>
        public APIGatewayProxyResponse Decrypt(DecryptionRequest request, ILambdaContext context)
        {
            LambdaLogger.Log("Encryption.Handler.Decrypt");

            if (String.IsNullOrEmpty(request.CipherText))
            {
                return CreateResponse(null);
            }

            var result = EncryptionService.Decrypt(request.CipherText);
            return CreateResponse(result);
        }

        /// <summary>
        /// Creates a response payload for the lambda execution results
        /// </summary>
        /// <returns>
        /// A response payload
        /// </returns>
        /// <param name="result"> The execution result to be encapsulated in a response payload</param>
        APIGatewayProxyResponse CreateResponse(String result)
        {
            LambdaLogger.Log("Encryption.Handler.CreateResponse");

            int statusCode = (result != null) ?
                (int)HttpStatusCode.OK :
                (int)HttpStatusCode.InternalServerError;

            string body = (result != null) ? result : string.Empty;

            return new APIGatewayProxyResponse
            {
                StatusCode = statusCode,
                Body = body
            };
        }
    }

}