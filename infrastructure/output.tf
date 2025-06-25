output "NEXT_PUBLIC_GRAPHQL_API_URL" {
  value = module.api.graphql_api_url
}

output "NEXT_PUBLIC_VIDEO_UPLOAD_BUCKET_ARN" {
  value = module.storage.s3_video_bucket_arn
}

output "NEXT_PUBLIC_STATIC_HOSTING_BUCKET_NAME" {
  value = module.hosting.s3_hosting_bucket_name
}
