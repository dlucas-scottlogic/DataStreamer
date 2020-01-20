FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-buster-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.0-buster AS build
WORKDIR /src
COPY DataStreamer.API.csproj DataStreamer.API.csproj
RUN dotnet restore "DataStreamer.API.csproj"

COPY . .

RUN dotnet build "DataStreamer.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DataStreamer.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DataStreamer.API.dll"]