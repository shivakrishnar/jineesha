
FROM mcr.microsoft.com/dotnet/sdk:6.0 as builder

RUN mkdir /build
ADD . /build 
WORKDIR /build

RUN dotnet tool install -g Amazon.Lambda.Tools
ENV PATH="$PATH:/root/.dotnet/tools"

RUN ./package.sh
