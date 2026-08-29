FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY services/learning-api/ElectroLab.LearningApi.csproj services/learning-api/
RUN dotnet restore services/learning-api/ElectroLab.LearningApi.csproj
COPY services/learning-api/ services/learning-api/
RUN dotnet publish services/learning-api/ElectroLab.LearningApi.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ElectroLab.LearningApi.dll"]
