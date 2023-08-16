namespace MyDockerWebAPI.Model
{
    public class Submission : BaseModel
    {
        public int FormId { get; set; }
        public int LocationId { get; set; }
        public string? Participants { get; set; }
        public DateTime? FromTime { get; set; }
        public DateTime? ToTime { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
        public Form? Form { get; set; }
        public Location? Location { get; set; }
    }

    public class SubmissionToAdd : BaseModel
    {
        public int FormId { get; set; }
        public int LocationId { get; set; }
        public string? Participants { get; set; }
        public int[] ParticipantIds
        {
            //get { return ParticipantIds; }
            set { Participants = string.Join(',', value); }
        }
        public DateTime? FromTime { get; set; }
        public DateTime? ToTime { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
    }
}