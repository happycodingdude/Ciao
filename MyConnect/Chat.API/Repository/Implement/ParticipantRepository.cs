namespace Chat.API.Repository
{
    public class ParticipantRepository : BaseRepository<Participant>, IParticipantRepository
    {
        public ParticipantRepository(CoreContext context) : base(context) { }
    }
}