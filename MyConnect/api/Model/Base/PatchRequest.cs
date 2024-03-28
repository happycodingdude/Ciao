using Microsoft.AspNetCore.JsonPatch;

public class PatchRequest<T> where T : class
{
    public Guid Id { get; set; }

    public JsonPatchDocument<T> PatchDocument { get; set; }
}