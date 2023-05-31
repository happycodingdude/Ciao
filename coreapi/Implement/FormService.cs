using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class FormService : BaseRepository<Form>, IFormService
    {
        public FormService(CoreContext context, IConfiguration configuration) : base(context, configuration)
        {

        }
    }
}