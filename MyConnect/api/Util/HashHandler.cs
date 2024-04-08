using System.Text;

namespace MyConnect.Util
{
    public class HashHandler
    {
        public static string Encrypt(string data)
        {
            byte[] toEncodeAsBytes = ASCIIEncoding.ASCII.GetBytes(data);
            return Convert.ToBase64String(toEncodeAsBytes);
        }

        public static string Decrypt(string data)
        {
            return ASCIIEncoding.ASCII.GetString(Convert.FromBase64String(data));
        }
    }
}