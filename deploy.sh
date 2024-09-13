# Define the IAM Role ARN to assume
ROLE_ARN="arn:aws:iam::317299412255:role/JenkinsAccess"

# Assume the IAM Role and get temporary credentials
ASSUMED_ROLE=$(aws sts assume-role --role-arn "$ROLE_ARN" --role-session-name "jenkins-deploy")

# Extract the temporary credentials
AWS_ACCESS_KEY_ID=$(echo $ASSUMED_ROLE | jq -r '.Credentials.AccessKeyId')
AWS_SECRET_ACCESS_KEY=$(echo $ASSUMED_ROLE | jq -r '.Credentials.SecretAccessKey')
AWS_SESSION_TOKEN=$(echo $ASSUMED_ROLE | jq -r '.Credentials.SessionToken')

# Export the credentials for AWS CLI
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN

# Print the assumed role identity for verification
aws sts get-caller-identity

# Proceed with deployment
serverless deploy --stage development --aws-profile $AWS_PROFILE

# Clean up environment variables
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN
