output "graphql_api_url" {
  value = "https://${aws_api_gateway_rest_api.lambda_rest_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_deployment.lambda_rest_api_deployment.stage_name}/graphql"
  description = "The URL endpoint for the deployed API Gateway"
}