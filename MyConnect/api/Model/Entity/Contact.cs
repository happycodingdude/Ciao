using System.ComponentModel.DataAnnotations;
using MyConnect.Common;

namespace MyConnect.Model
{
    public class Contact : BaseModel
    {
        public string? Name { get; set; }
        public string? Username { get; set; }
        [MinLength(6)]
        public string? Password { get; set; }
        public string? Avatar { get; set; }
        public bool IsOnline { get; set; }
        public DateTime? LastLogout { get; set; }
        public ICollection<ScheduleContact>? ScheduleContacts { get; set; }
        public ICollection<Participant>? Participants { get; set; }
        public ICollection<Message>? Messages { get; set; }

        public void Login()
        {
            IsOnline = true;
        }

        public void Logout()
        {
            IsOnline = false;
            LastLogout = DateTime.Now;
        }

        public void EncryptPassword(){
            Password = Hash.Encrypt(Password);
        }

        public void DecryptPassword(){
            Password = Hash.Decrypt(Password);
        }
    }

    // public class ContactNoReference : BaseModel
    // {
    //     public string? Name { get; set; }
    //     public string? Username { get; set; }
    //     public string? Password { get; set; }
    //     public string? Avatar { get; set; }
    //     public bool IsOnline { get; set; }
    //     public DateTime? LastLogout { get; set; }
    // }
}