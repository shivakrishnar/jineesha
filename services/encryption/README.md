### asure.encryption

This contains a dedicated AWS Lambda for decrypting the Evolution API service account credentials used by the Advanced HR 2.0 application.
Since the symmetric cipher used is Microsoft-specific in its implementation and there exist no Node.js-equivalent libraries; the use
of a Node.js runtime for the Lambda runtime is therefore not applicable. Therefore, the relevant logic has been ported from VB.Net to .Net Core
in order to make use of that runtime for the encryption/decryption service.
