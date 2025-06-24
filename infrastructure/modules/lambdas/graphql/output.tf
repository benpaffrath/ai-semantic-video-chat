output "graphql_lambda_invoke_uri" {
  value = aws_lambda_function.graphql-function.invoke_arn
}

output "graphql_lambda_arn" {
  value = aws_lambda_function.graphql-function.arn
}
