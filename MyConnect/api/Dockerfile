FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source
# COPY *.csproj .
COPY ["MyConnect.csproj", "api/"]
RUN dotnet restore "MyConnect.csproj"
COPY . .
WORKDIR "/source/api"
RUN dotnet build "MyConnect.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MyConnect.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MyConnect.dll"]