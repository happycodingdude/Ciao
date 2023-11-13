using System.Security.Cryptography;

namespace MyConnect.Authentication
{
    public static class KeyGenerator
    {
        public static void GenerateRandom()
        {
            // Generate a random 256-bit key
            var random = new RNGCryptoServiceProvider();
            var key = new byte[32];
            random.GetBytes(key);

            // Convert the key to a base64-encoded string
            var keyString = Convert.ToBase64String(key);
            Console.WriteLine(keyString);
        }
    }
}