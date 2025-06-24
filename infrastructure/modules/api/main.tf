resource "aws_api_gateway_rest_api" "lambda_rest_api" {
  name        = "${var.application_name}-graphql-${var.environment}"
  description = "REST API for ${var.application_name}-${var.environment}"

  tags = var.tags
}

resource "aws_api_gateway_resource" "graphql" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  parent_id   = aws_api_gateway_rest_api.lambda_rest_api.root_resource_id
  path_part   = "graphql"
}

resource "aws_api_gateway_method" "get_graphql" {
  rest_api_id   = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id   = aws_api_gateway_resource.graphql.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "post_graphql" {
  rest_api_id   = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id   = aws_api_gateway_resource.graphql.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "options_graphql" {
  rest_api_id   = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id   = aws_api_gateway_resource.graphql.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_graphql" {
  rest_api_id             = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id             = aws_api_gateway_resource.graphql.id
  http_method             = aws_api_gateway_method.get_graphql.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.graphql_lambda_invoke_uri
}

resource "aws_api_gateway_integration" "post_graphql" {
  rest_api_id             = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id             = aws_api_gateway_resource.graphql.id
  http_method             = aws_api_gateway_method.post_graphql.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = var.graphql_lambda_invoke_uri
}

resource "aws_api_gateway_integration" "options_graphql" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id = aws_api_gateway_resource.graphql.id
  http_method = aws_api_gateway_method.options_graphql.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = <<EOF
{
  "statusCode": 200
}
EOF
  }
}

resource "aws_api_gateway_method_response" "options_graphql" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id = aws_api_gateway_resource.graphql.id
  http_method = aws_api_gateway_method.options_graphql.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "options_graphql" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id = aws_api_gateway_resource.graphql.id
  http_method = aws_api_gateway_method.options_graphql.http_method
  status_code = aws_api_gateway_method_response.options_graphql.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'https://${var.domain_name}'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,GET,POST'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization'"
  }
}

resource "aws_api_gateway_method_response" "post_graphql_cors" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id = aws_api_gateway_resource.graphql.id
  http_method = aws_api_gateway_method.post_graphql.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "post_graphql_cors" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id = aws_api_gateway_resource.graphql.id
  http_method = aws_api_gateway_method.post_graphql.http_method
  status_code = aws_api_gateway_method_response.post_graphql_cors.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://${var.domain_name}'"
  }
}

resource "aws_api_gateway_method_response" "get_graphql_cors" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id = aws_api_gateway_resource.graphql.id
  http_method = aws_api_gateway_method.get_graphql.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "get_graphql_cors" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  resource_id = aws_api_gateway_resource.graphql.id
  http_method = aws_api_gateway_method.get_graphql.http_method
  status_code = aws_api_gateway_method_response.get_graphql_cors.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://${var.domain_name}'"
  }
}

resource "aws_api_gateway_deployment" "lambda_rest_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.lambda_rest_api.id
  stage_name  = var.environment

  depends_on = [
    aws_api_gateway_integration.get_graphql,
    aws_api_gateway_integration.post_graphql,
    aws_api_gateway_integration.options_graphql
  ]
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/api_gw/${aws_api_gateway_rest_api.lambda_rest_api.name}"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.graphql_lambda_arn
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.lambda_rest_api.execution_arn}/*/*"
}
