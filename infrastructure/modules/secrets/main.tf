resource "aws_secretsmanager_secret" "openai_secret" {
  name = "${var.application_name}-${var.environment}-openai-api-key"
  tags = var.tags
}

resource "aws_secretsmanager_secret" "pinecone_secret" {
  name = "${var.application_name}-${var.environment}-pinecone-api-key"
  tags = var.tags
}

resource "aws_secretsmanager_secret" "langsmith_secret" {
  name = "${var.application_name}-${var.environment}-langsmith-api-key"
  tags = var.tags
}