resource "aws_sqs_queue" "sqs-transcription-queue" {
  name                       = "${var.application_name}-${var.environment}-transcription-queue"
  visibility_timeout_seconds = 900
  message_retention_seconds  = 345600 # 4 days
  delay_seconds              = 0
  max_message_size           = 262144 # 256 KB
  receive_wait_time_seconds  = 10

  tags = var.tags
}

resource "aws_sqs_queue" "sqs-embeddings-queue" {
  name                       = "${var.application_name}-${var.environment}-embeddings-queue"
  visibility_timeout_seconds = 900
  message_retention_seconds  = 345600 # 4 days
  delay_seconds              = 0
  max_message_size           = 262144 # 256 KB
  receive_wait_time_seconds  = 10

  tags = var.tags
}

resource "aws_sqs_queue" "sqs-chat-queue" {
  name                       = "${var.application_name}-${var.environment}-chat-queue"
  visibility_timeout_seconds = 900
  message_retention_seconds  = 345600 # 4 days
  delay_seconds              = 0
  max_message_size           = 262144 # 256 KB
  receive_wait_time_seconds  = 10

  tags = var.tags
}
