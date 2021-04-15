old_aws_config_cli_follow_urlparam_value=$(aws configure get cli_follow_urlparam)
aws configure set cli_follow_urlparam false
aws ssm put-parameter --name "/hr/esignature/simplesign/legacyClientCutOffDate" --value "04/14/2021" --type String --overwrite
aws ssm put-parameter --name "/hr/esignature/simplesign/directClientPricingData" --value "{\"monthlyCost\":\"10.00\",\"costPerRequest\":\"1.00\"}" --type String --overwrite
aws ssm put-parameter --name "/hr/esignature/simplesign/indirectClientPricingData" --value "{\"monthlyCost\":\"6.00\",\"costPerRequest\":\"0.55\"}" --type String --overwrite
aws configure set cli_follow_urlparam $old_aws_config_cli_follow_urlparam_value