namespace MyConnect.Interface
{
    public interface IPatchService<T> where T : class
    {
        List<PatchResponse> BulkEdit(List<PatchRequest<T>> patchs);
    }
}