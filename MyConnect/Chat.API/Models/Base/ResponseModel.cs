namespace Chat.API.Model;

public class ResponseModel1<T>
{
    // public HttpStatusCode code { get; private set; }
    // public string error { get; private set; }
    // public T data { get; private set; }
    // private readonly JsonSerializerSettings jsonSetting = new JsonSerializerSettings
    // {
    //     ReferenceLoopHandling = ReferenceLoopHandling.Ignore
    // };

    // public ResponseModel1() { }

    // public ResponseModel1(T data)
    // {
    //     this.data = data;
    // }

    // public ResponseModel1<T> Ok()
    // {
    //     code = HttpStatusCode.OK;
    //     return this;
    // }

    // public ResponseModel1<T> BadRequest(Exception exception)
    // {
    //     code = HttpStatusCode.BadRequest;
    //     this.error = exception.Message;

    //     // Additional data in some case
    //     // if (exception.Data.Count != 0)
    //     //     data = exception.Data["Data"] as T;

    //     return this;
    // }

    // public Task ExecuteAsync(HttpContext httpContext)
    // {
    //     var response = httpContext.Response;
    //     response.StatusCode = (int)code;
    //     var header = httpContext.Request.Headers["Data"];
    //     if (header == "full")
    //         jsonSetting.ContractResolver = new IgnoreJsonAttributesResolver();
    //     var json = JsonConvert.SerializeObject(this, jsonSetting);
    //     response.ContentType = "application/json";
    //     return response.WriteAsync(json);
    // }
}