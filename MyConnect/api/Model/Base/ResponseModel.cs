using System.Net;
using Microsoft.AspNetCore.Mvc;
using MyConnect.Configuration;
using Newtonsoft.Json;

namespace MyConnect.Model
{
    public class ResponseModel<T> : ActionResult where T : class
    {
        [JsonIgnore]
        public HttpStatusCode code { get; private set; }
        public string? error { get; private set; }
        public T? data { get; private set; }
        private static readonly JsonSerializerSettings jsonSetting = new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
        };

        public ResponseModel(T? data = null)
        {
            this.data = data;
        }

        // public ResponseModel(T? data, bool isFull)
        // {
        //     this.data = data;
        //     this.isFull = isFull;
        // }

        public ResponseModel(string error)
        {
            this.error = error;
        }

        // Default method
        public override void ExecuteResult(ActionContext context)
        {
            var response = context.HttpContext.Response;
            response.StatusCode = (int)code;
            var header = context.HttpContext.Request.Headers["Data"];
            if (header == "full")
                jsonSetting.ContractResolver = new IgnoreJsonAttributesResolver();
            var json = JsonConvert.SerializeObject(this, jsonSetting);
            response.ContentType = "application/json";
            response.WriteAsync(json);
        }

        public ResponseModel<T> Ok()
        {
            code = HttpStatusCode.OK;
            return this;
        }

        public ResponseModel<T> BadRequest(Exception exception)
        {
            code = HttpStatusCode.BadRequest;
            this.error = exception.Message;

            // Additional data in some case
            if (exception.Data.Count != 0)
                data = exception.Data["Data"] as T;

            return this;
        }
    }
}