namespace MyConnect.Model
{
    public class RegisterConnection
    {
        public Guid Id { get; set; }
        public string? Token { get; set; }
    }

    public class CustomNotification<T> where T : class
    {
        public string @event { get; set; }
        public object data { get; set; }

        public CustomNotification(string @event, T data)
        {
            this.@event = @event;
            this.data = data;
        }
    }
}