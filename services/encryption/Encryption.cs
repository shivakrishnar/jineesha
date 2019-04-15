
using System;

using System.Text;
using System.Security.Cryptography;
using System.IO;

using Amazon.Lambda.Core;
using Newtonsoft.Json;



namespace Encryption
{
    /// <summary>
    /// A class for handling the encryption and decryption of a string using the Rijndael
    /// symmetric cipher with RFC2898 for creating the initialization vector and key
    /// </summary>
    public class EncryptionService
    {
        /// <summary>
        /// Decrypts a given cipher text <paramref name="cipherText"/> 
        /// </summary>
        /// <returns>
        /// The plaintext representation of the given ciphertext
        /// </returns>
        /// <param name="cipherText"> The text to be decrypted </param>
        public static String Decrypt(String cipherText)
        {
            LambdaLogger.Log("Encryption.EncryptionService.Decrypt");

            if (String.IsNullOrEmpty(cipherText))
            {
                return null;
            }

            try
            {
                var cipher = JsonConvert.DeserializeObject<Cipher>(Utils.GetSecret("EvoApiServiceAccountEncryptionKeys"));

                var saltBytes = Encoding.Unicode.GetBytes(cipher.salt);
                var cipherBytes = Convert.FromBase64String(cipherText);

                var pdb = new Rfc2898DeriveBytes(cipher.keyPhrase, saltBytes);
                var decryptedData = Decrypt(cipherBytes, pdb.GetBytes(32), pdb.GetBytes(16));

                var plainText = Encoding.Unicode.GetString(decryptedData);
                return plainText;
            }
            catch (Exception ex)
            {
                LambdaLogger.Log(String.Format("Error decrypting cipherText. Reason: {0}", ex.ToString()));
                return null;
            }

        }

        /// <summary>
        /// Decrypts a given cipher text
        /// </summary>
        /// <returns>
        /// A byte representation of the decrypted ciphertext
        /// </returns>
        /// <param name="cipherData"> The byte representation of the original ciphertext</param>
        /// <param name="Key"> The Rfc2898DeriveBytes key for the cipher</param>
        /// <param name="IV"> The initialization vector to use in the decryption</param>
        static Byte[] Decrypt(Byte[] cipherData, Byte[] Key, Byte[] IV)
        {
            LambdaLogger.Log("Encryption.EncryptionService.Decrypt");

            var ms = new MemoryStream();

            var alg = Rijndael.Create();
            alg.Key = Key;
            alg.IV = IV;

            var cs = new CryptoStream(ms, alg.CreateDecryptor(), CryptoStreamMode.Write);
            cs.Write(cipherData, 0, cipherData.Length);
            cs.FlushFinalBlock();
            cs.Close();

            return ms.ToArray();
        }
    }
}