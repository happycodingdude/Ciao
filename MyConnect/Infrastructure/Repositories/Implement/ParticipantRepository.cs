namespace Infrastructure.Repositories;

public class ParticipantRepository : BaseRepository<Participant>, IParticipantRepository
{
    public ParticipantRepository(AppDbContext context) : base(context) { }
}