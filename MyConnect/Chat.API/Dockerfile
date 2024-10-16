FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file and restore the dependencies
COPY MyConnect/MyConnect.sln .
COPY MyConnect/Application/Application.csproj Application/
COPY MyConnect/Chat.API/Chat.API.csproj Chat.API/
COPY MyConnect/Infrastructure/Infrastructure.csproj Infrastructure/
COPY MyConnect/Presentation/Presentation.csproj Presentation/
COPY MyConnect/Domain/Domain.csproj Domain/
COPY MyConnect/Shared/Shared.csproj Shared/
RUN dotnet restore

COPY . .

WORKDIR /src/Chat.API
RUN dotnet build -c Release -o /app/build

FROM build as publish
RUN dotnet publish -c Release --no-restore -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Chat.API.dll"]