output "s3_video_bucket_arn" {
  description = "Arn of s3 bucket for user videos"
  value       = aws_s3_bucket.app-data.arn
}
