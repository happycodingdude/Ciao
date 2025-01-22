FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
WORKDIR /src

# Copy the solution file and restore the dependencies
COPY MyConnect.sln .
COPY Domain/Domain.csproj Domain/
COPY Shared/Shared.csproj Shared/
COPY Application/Application.csproj Application/
COPY Infrastructure/Infrastructure.csproj Infrastructure/
COPY Presentation/Presentation.csproj Presentation/
COPY SendProcessor/SendProcessor.csproj SendProcessor/
RUN dotnet restore -a $TARGETARCH

# Copy everything else
COPY . .

# Build and publish the project
WORKDIR /src/SendProcessor
RUN dotnet publish -a $TARGETARCH -c Release -o /app

# Copy additional configuration files
COPY Infrastructure/Notifications/service-account-config.json /app

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

# Run the app
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "SendProcessor.dll"]
