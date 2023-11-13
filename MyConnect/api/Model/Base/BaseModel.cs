using System;
namespace MyConnect.Model
{
    public class BaseModel
    {
        public Guid Id { get; set; }
        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }

        public void BeforeAdd()
        {
        }

        public void BeforeUpdate(BaseModel current)
        {
            CreatedTime = current.CreatedTime;
            UpdatedTime = DateTime.Now;
        }
    }
}