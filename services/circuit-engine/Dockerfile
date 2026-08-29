FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/ElectroLab.CircuitSim/ElectroLab.CircuitSim.csproj src/ElectroLab.CircuitSim/
COPY services/circuit-engine/ElectroLab.CircuitEngine.csproj services/circuit-engine/
RUN dotnet restore services/circuit-engine/ElectroLab.CircuitEngine.csproj
COPY src/ElectroLab.CircuitSim/ src/ElectroLab.CircuitSim/
COPY services/circuit-engine/ services/circuit-engine/
RUN dotnet publish services/circuit-engine/ElectroLab.CircuitEngine.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ElectroLab.CircuitEngine.dll"]
