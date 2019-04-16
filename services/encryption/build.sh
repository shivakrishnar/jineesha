#!/bin/bash
echo 'removing existing buid artifact, if any...'
rm -f asure.encryption.zip

echo 'creating new build image...'
docker build -t lambda-builder:latest .

echo 'extracting build artifact...'
docker run --rm lambda-builder:latest cat /build/bin/release/netcoreapp2.1/asure.encryption.zip > asure.encryption.zip

echo 'cleaning up resources..'
docker system prune -f