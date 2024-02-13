using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class ContactService : IContactService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ContactService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Contact? GetByFriendId2(Guid id)
        {
            var friend = _unitOfWork.Friend.GetAll().FirstOrDefault(q => q.ContactId2 == id);
            if(friend == null) 
                return null;
            return _unitOfWork.Contact.GetById(id);
        }
    }
}