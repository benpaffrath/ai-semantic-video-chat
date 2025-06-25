output "sqs_transcription_queue_arn" {
  value = aws_sqs_queue.sqs-transcription-queue.arn
}

output "sqs_transcription_queue_url" {
  value = aws_sqs_queue.sqs-transcription-queue.url
}


output "sqs_embeddings_queue_arn" {
  value = aws_sqs_queue.sqs-embeddings-queue.arn
}

output "sqs_embeddings_queue_url" {
  value = aws_sqs_queue.sqs-embeddings-queue.url
}

output "sqs_chat_queue_arn" {
  value = aws_sqs_queue.sqs-chat-queue.arn
}

output "sqs_chat_queue_url" {
  value = aws_sqs_queue.sqs-chat-queue.url
}

