output "s3_video_bucket_arn" {
  description = "Arn of s3 bucket for user videos"
  value       = aws_s3_bucket.app-data.arn
}

output "s3_video_bucket_name" {
  description = "Name of s3 bucket for user videos"
  value       = aws_s3_bucket.app-data.bucket
}
