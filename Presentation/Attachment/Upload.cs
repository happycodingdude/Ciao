using Microsoft.AspNetCore.Mvc;

namespace Presentation.Attachments;

public static class UploadRequest
{
    public record Request(IFormFileCollection files) : IRequest<List<UploadResponse>>;

    internal sealed class Handler : IRequestHandler<Request, List<UploadResponse>>
    {
        IFirebaseFunction _firebaseFunction;

        public Handler(IFirebaseFunction firebaseFunction)
        {
            _firebaseFunction = firebaseFunction;
        }

        public async Task<List<UploadResponse>> Handle(Request request, CancellationToken cancellationToken)
        {
            // Get files from request
            if (request.files is null || request.files.Count == 0)
                throw new BadRequestException("No files uploaded");

            var result = new List<UploadResponse>();
            foreach (var file in request.files)
            {
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);

                var objectName = file.ContentType switch
                {
                    "document/doc" => $"files/{file.FileName}",
                    "document/docx" => $"files/{file.FileName}",
                    "application/pdf" => $"files/{file.FileName}",
                    "application/vnd.ms-excel" => $"files/{file.FileName}",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" => $"files/{file.FileName}",
                    "video/mp4" => $"videos/{file.FileName}",
                    "video/mov" => $"videos/{file.FileName}",
                    _ => $"images/{file.FileName}",
                };
                var uploadResult = await _firebaseFunction.UploadAsync(
                    new UploadModel
                    {
                        Folder = objectName,
                        FileStream = memoryStream,
                        ContentType = file.ContentType
                    });
                result.Add(
                    new UploadResponse
                    {
                        Type = file.ContentType,
                        MediaName = file.FileName,
                        MediaSize = file.Length,
                        MediaUrl = uploadResult.MediaLink
                    });
            }

            return result;
        }
    }
}

public class UploadEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Attachment).MapPost("/upload",
        async (ISender sender, IFormFileCollection files) =>
        {
            var query = new UploadRequest.Request(files);
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .RequireAuthorization("Basic")
        .DisableAntiforgery()
        .Accepts<List<IFormFile>>("multipart/form-data");
    }
}