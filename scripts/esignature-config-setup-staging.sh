old_aws_config_cli_follow_urlparam_value=$(aws configure get cli_follow_urlparam)
aws configure set cli_follow_urlparam false
aws ssm put-parameter --name "/hr/esignature/simplesign/legacyClientCutOffDate" --value "10/22/2020" --type String --overwrite
aws configure set cli_follow_urlparam $old_aws_config_cli_follow_urlparam_value