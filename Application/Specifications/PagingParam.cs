namespace Application.Specifications;

public class PagingParam
{
    private int limit { get; }
    private int skip { get; }
    private int nextSkip { get; }

    public PagingParam(int page)
    {
        limit = AppConstants.DefaultLimit;
        skip = AppConstants.DefaultLimit * (page - 1);
        nextSkip = AppConstants.DefaultLimit * page;
    }

    public int Limit { get { return limit; } }

    public int Skip { get { return skip; } }

    public int NextSkip { get { return nextSkip; } }
}