using System.ComponentModel.DataAnnotations;
using MyConnect.Common;
using Newtonsoft.Json;

namespace MyConnect.Model
{
    public class Contact : BaseModel
    {
        public string? Name { get; set; }
        [JsonIgnore]
        public string? Username { get; set; }
        [MinLength(6)]
        [JsonIgnore]
        public string? Password { get; set; }
        public string? Avatar { get; set; }
        public bool IsOnline { get; set; }
        [JsonIgnore]
        public DateTime? LastLogout { get; set; }
        public ICollection<ScheduleContact>? ScheduleContacts { get; set; }
        public ICollection<Participant>? Participants { get; set; }
        public ICollection<Message>? Messages { get; set; }
        // public ICollection<Friend>? Friends { get; set; }

        public void Login()
        {
            IsOnline = true;
        }

        public void Logout()
        {
            IsOnline = false;
            LastLogout = DateTime.Now;
        }

        public void EncryptPassword()
        {
            Password = Hash.Encrypt(Password);
        }

        public void DecryptPassword()
        {
            Password = Hash.Decrypt(Password);
        }
    }
}