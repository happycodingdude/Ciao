namespace Application.Specifications;

public class PagingParam
{
    public int Limit { get; private set; }
    public int Skip { get; private set; }

    public PagingParam(int limit, int page)
    {
        Limit = limit;
        Skip = limit * (page - 1);
    }
}