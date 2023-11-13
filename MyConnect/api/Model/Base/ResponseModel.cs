using System.Net;
using Microsoft.AspNetCore.Mvc;
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

        public ResponseModel(string error)
        {
            this.error = error;
        }

        public override void ExecuteResult(ActionContext context)
        {
            var response = context.HttpContext.Response;
            response.StatusCode = (int)code;
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