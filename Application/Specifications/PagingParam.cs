namespace Application.Specifications;

public class PagingParam
{
    private int limit { get; }
    private int skip { get; }
    private int nextSkip { get; }

    public PagingParam(int page, int limit)
    {
        this.limit = limit;
        skip = limit * (page - 1);
        nextSkip = limit * page;
    }

    public int Limit => limit;
    public int Skip => skip;
    public int NextSkip => nextSkip;
}