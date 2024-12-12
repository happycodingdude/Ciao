
namespace Infrastructure.Repositories;

public class ParticipantRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Participant>(context, uow), IParticipantRepository { }