output "openai_secret_arn" {
  description = "ARN of the OpenAI secret"
  value       = aws_secretsmanager_secret.openai_secret.arn
}

output "pinecone_secret_arn" {
  description = "ARN of the Pinecone secret"
  value       = aws_secretsmanager_secret.pinecone_secret.arn
}

output "langsmith_secret_arn" {
  description = "ARN of the LangSmith secret"
  value       = aws_secretsmanager_secret.langsmith_secret.arn
}