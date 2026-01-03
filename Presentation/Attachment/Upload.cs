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

            var contentTypeLookup = new Dictionary<string, (string folder, string attachmentType)>
            {
                ["document/doc"] = new("files", "file"),
                ["document/docx"] = new("files", "file"),
                ["application/pdf"] = new("files", "file"),
                ["application/vnd.ms-excel"] = new("files", "file"),
                ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = new("files", "file"),
                ["video/mp4"] = new("videos", "video"),
                ["video/mov"] = new("videos", "video"),
                ["image/jpg"] = new("images", "image"),
                ["image/jpeg"] = new("images", "image"),
                ["image/png"] = new("images", "image"),
                ["image/gif"] = new("images", "image"),
            };

            var result = new List<UploadResponse>();
            foreach (var file in request.files)
            {
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                var (folder, attachmentType) = contentTypeLookup.TryGetValue(file.ContentType, out var f)
                    ? f
                    : (null, null);
                if (folder is null)
                    throw new BadRequestException($"Unsupported file type: {file.ContentType}");

                var uploadedUrl = await _firebaseFunction.UploadAsync(
                    new UploadModel
                    {
                        Folder = folder,
                        FileName = file.FileName,
                        FileStream = memoryStream,
                        ContentType = file.ContentType
                    });
                result.Add(
                    new UploadResponse
                    {
                        Type = attachmentType!,
                        MediaName = file.FileName,
                        MediaSize = file.Length,
                        MediaUrl = uploadedUrl
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