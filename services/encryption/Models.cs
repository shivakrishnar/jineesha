using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace Encryption
{

    /// <summary>
    /// A representation of a request to decrypt a ciphertext
    /// </summary>
    public class DecryptionRequest
    {
        [JsonProperty("cipherText")]
        public string CipherText { get; set; }
    }

    /// <summary>
    /// A representation of a request to encrypt a given text
    /// </summary>
    public class EncryptionRequest
    {
        [JsonProperty("plainText")]
        public string PlainText { get; set; }
    }

    /// <summary>
    /// A representation of the cipher used in the encryption/decryption process
    /// </summary>
    public class Cipher
    {
        [JsonProperty("salt")]
        public string salt { get; set; }

        [JsonProperty("keyPhrase")]
        public string keyPhrase { get; set; }
    }

}