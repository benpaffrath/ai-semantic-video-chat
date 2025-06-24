output "langchain_layer_arn" {
  value = aws_lambda_layer_version.langchain_layer.arn
}

output "ffmpeg_layer_arn" {
  value = aws_lambda_layer_version.ffmpeg_layer.arn
}
