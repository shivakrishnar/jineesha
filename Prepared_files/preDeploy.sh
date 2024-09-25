## postDeploy script install aws cli and configure it

#!/bin/bash

# Update the package list and install prerequisites
sudo apt-get update
sudo apt-get install -y unzip

# Download the AWS CLI installation package
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

# Unzip the package
unzip awscliv2.zip

# Run the installation script
sudo ./aws/install

# Verify the installation
aws --version

# Clean up
rm -rf awscliv2.zip aws