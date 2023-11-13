using Microsoft.EntityFrameworkCore;
using MyConnect.Model;
using MyConnect.Repository;

namespace MyConnect.UnitOfWork
{
    public class UnitOfWork : IDisposable
    {
        private readonly CoreContext _context = new CoreContext();
        private IRepository<Contact> contactRepository;

        public IRepository<Contact> ContactRepository
        {
            get
            {

                if (contactRepository == null)
                {
                    contactRepository = new BaseRepository<Contact>(_context);
                }
                return contactRepository;
            }
        }

        public void Save()
        {
            _context.SaveChanges();
        }

        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
            }
            disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}