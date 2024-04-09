using System.Net;
using Microsoft.AspNetCore.Mvc;
using MyConnect.Configuration;
using Newtonsoft.Json;

namespace MyConnect.Model
{
    public class ResponseModel<T> : ActionResult
    {
        private HttpStatusCode code { get; set; }
        public string error { get; private set; }
        public T data { get; private set; }
        private readonly JsonSerializerSettings jsonSetting = new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
        };

        public ResponseModel() { }

        public ResponseModel(T data)
        {
            this.data = data;
        }

        // Default method
        public override void ExecuteResult(ActionContext context)
        {
            var response = context.HttpContext.Response;
            response.StatusCode = (int)code;
            Console.WriteLine(response.StatusCode);
            var header = context.HttpContext.Request.Headers["Data"];
            if (header == "full")
                jsonSetting.ContractResolver = new IgnoreJsonAttributesResolver();
            var json = JsonConvert.SerializeObject(this, jsonSetting);
            response.ContentType = "application/json";
            response.WriteAsync(json);
        }

        public ResponseModel<T> Ok()
        {
            // Console.WriteLine("Ok");
            code = HttpStatusCode.OK;
            return this;
        }

        public ResponseModel<T> BadRequest(Exception exception)
        {
            // Console.WriteLine("BadRequest");
            code = HttpStatusCode.BadRequest;
            this.error = exception.Message;

            // Additional data in some case
            // if (exception.Data.Count != 0)
            //     data = exception.Data["Data"] as T;

            return this;
        }
    }
}