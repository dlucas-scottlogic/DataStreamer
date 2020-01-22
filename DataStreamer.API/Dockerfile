FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-alpine AS base

# Install java
RUN apk update
RUN apk fetch openjdk8
RUN apk add openjdk8
#RUN java -version

FROM mcr.microsoft.com/dotnet/core/sdk:3.0-alpine3.9 AS build
WORKDIR /src
# Copy the projectfile for restore
COPY DataStreamer.API.csproj DataStreamer.API.csproj

# Run package nuget package restore
RUN dotnet restore "DataStreamer.API.csproj"

# copy all source files for build
COPY . .

#Run build
RUN dotnet build "DataStreamer.API.csproj" -c Release -o /app/build

#Run publish
FROM build AS publish
RUN dotnet publish "DataStreamer.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY Libraries/generator.jar Libraries/generator.jar
ENTRYPOINT ["dotnet", "DataStreamer.API.dll"]