output "GRAPHQL_API_URL" {
  value = module.api.graphql_api_url
}

output "VIDEO_UPLOAD_BUCKET_ARN" {
  value = module.storage.s3_video_bucket_arn
}

output "STATIC_HOSTING_BUCKET_NAME" {
  value = module.hosting.s3_hosting_bucket_name
}
