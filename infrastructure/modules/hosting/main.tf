resource "aws_s3_bucket" "app-hosting" {
  bucket = var.domain_name

  tags = var.tags
}

resource "aws_s3_bucket_ownership_controls" "app-hosting-bucket" {
  bucket = aws_s3_bucket.app-hosting.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "app-hosting-bucket" {
  bucket                  = aws_s3_bucket.app-hosting.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "app-hosting-bucket-acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.app-hosting-bucket,
    aws_s3_bucket_public_access_block.app-hosting-bucket
  ]

  bucket = aws_s3_bucket.app-hosting.id
  acl    = "public-read"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app-hosting-bucket-encryption-conf" {
  bucket = aws_s3_bucket.app-hosting.id

  rule {
    bucket_key_enabled = false

    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "app-hosting-bucket-versioning" {
  bucket = aws_s3_bucket.app-hosting.id

  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_website_configuration" "app-hosting-bucket-website-conf" {
  bucket = aws_s3_bucket.app-hosting.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_cors_configuration" "app-bucket-cors-conf" {
  bucket = aws_s3_bucket.app-hosting.id

  cors_rule {
    allowed_headers = ["Authorization", "Content-Length"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_policy" "app-hosting-cloudfront-policy" {
  bucket = aws_s3_bucket.app-hosting.id
  policy = jsonencode({
    "Version": "2008-10-17",
    "Id": "PolicyForCloudFrontPrivateContentAppHosting",
    "Statement": [
      {
        "Sid": "AllowCloudFrontServicePrincipal",
        "Effect": "Allow",
        "Principal": {
          "Service": "cloudfront.amazonaws.com"
        },
        "Action": "s3:GetObject",
        "Resource": "${aws_s3_bucket.app-hosting.arn}/*",
        "Condition": {
          "StringEquals": {
            "AWS:SourceArn": aws_cloudfront_distribution.app-distribution.arn
          }
        }
      }
    ]
  })
}