
FROM mcr.microsoft.com/dotnet/core/sdk as builder

RUN mkdir /build
ADD . /build 
WORKDIR /build

RUN ./package.sh
