output "dynamodb_table_arn" {
  value = aws_dynamodb_table.knowledge_table.arn
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.knowledge_table.name
}