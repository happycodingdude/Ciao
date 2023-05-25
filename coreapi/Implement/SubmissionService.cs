using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class SubmissionService : BaseRepository<Submission>, ISubmissionService
    {
        public SubmissionService(CoreContext context, IConfiguration configuration) : base(context, configuration)
        {

        }
    }
}