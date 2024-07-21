namespace Infrastructure.Middleware.Exceptions;

public class BadRequestException : Exception
{
    public BadRequestException(string message, Exception innerEx = null) : base(message, innerEx) { }
}