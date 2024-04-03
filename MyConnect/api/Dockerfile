# Use the latest .NET Core SDK image as the base
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory inside the container
WORKDIR /source

# Copy the project files to the container's working directory
COPY *.csproj .

# Restore the NuGet packages
RUN dotnet restore

# Copy the remaining project files to the container's working directory
COPY . .

# Build the project
RUN dotnet build --configuration Release --no-restore

# Publish the project
RUN dotnet publish --configuration Release --no-build --output /app

# Use the latest .NET Core runtime image as the base for the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Set the working directory inside the container
WORKDIR /app

# Copy the published output from the build stage to the final image
COPY --from=build /app .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

# Set the entry point for the container
ENTRYPOINT ["dotnet", "MyConnect.dll"]

