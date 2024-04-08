using System.ComponentModel.DataAnnotations;

namespace MyConnect.Model
{
    public class ForgotPassword
    {
        public string? Username { get; set; }
        [MinLength(6)]
        public string? Password { get; set; }
    }
}