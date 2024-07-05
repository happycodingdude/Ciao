namespace Chat.API.Model;

public class PagingParam
{
    public List<Search>? Searchs { get; set; } = new List<Search>();
    public List<Include>? Includes { get; set; } = new List<Include>();
    public List<Sort>? Sorts { get; set; } = new List<Sort>();
}

public class Search
{
    public string? FieldName { get; set; }
    public string? FieldValue { get; set; }
    public string? Operator { get; set; }
}

public class Include
{
    public string? TableName { get; set; }
    public bool IsCollection { get; set; }
}

public class Sort
{
    public string? FieldName { get; set; }
    public string? SortType { get; set; }
}