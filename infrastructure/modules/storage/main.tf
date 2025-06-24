locals {
  allowed_origins = [
    "https://${var.domain_name}"
  ]

  allowed_origins_with_dev = terraform.workspace == "dev" ? concat(local.allowed_origins, ["http://localhost:5173", "http://localhost:3000"]) : local.allowed_origins
}

resource "aws_s3_bucket" "app-data" {
  bucket = "${var.domain_name}.data"

  tags = var.tags
}

resource "aws_s3_bucket_cors_configuration" "app-data-cors" {
  bucket = aws_s3_bucket.app-data.id

  cors_rule {
    allowed_origins = local.allowed_origins_with_dev
    allowed_methods = ["GET", "PUT", "DELETE", "HEAD"]
    allowed_headers  = ["*"]
    max_age_seconds = 3000
  }
}


resource "aws_s3_bucket_ownership_controls" "app-hosting-bucket" {
  bucket = aws_s3_bucket.app-data.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "app-data-bucket-acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.app-hosting-bucket,
  ]
  acl = "private"
  bucket = aws_s3_bucket.app-data.id
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app-hosting-bucket-encryption-conf" {
  bucket = aws_s3_bucket.app-data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "app-hosting-bucket-versioning" {
  bucket = aws_s3_bucket.app-data.id

  versioning_configuration {
    status = "Disabled"
  }
}