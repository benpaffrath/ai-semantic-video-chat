data "aws_caller_identity" "current" {}

locals {
  function_name        = "${var.application_name}-${var.environment}-transcription"
  function_handler     = "handler.lambda_handler"
  function_runtime     = "python3.11"
  function_timeout     = 900
  function_memory_size = 4096
  function_zip         = "../apps/transcription/dist/lambda.zip"
}

resource "aws_lambda_function" "transcription-function" {
  function_name = local.function_name
  handler       = local.function_handler
  runtime       = local.function_runtime
  timeout       = local.function_timeout

  filename         = local.function_zip
  source_code_hash = filebase64sha256(local.function_zip)

  role = aws_iam_role.function_role.arn

  layers = [var.ffmpeg_layer_arn, var.langchain_layer_arn]

  memory_size = local.function_memory_size

  ephemeral_storage {
    size = 4096
  }

  environment {
    variables = {
      ENVIRONMENT                    = var.environment
      EMBEDDINGS_SQS_QUEUE_URL       = var.sqs_output_url
      SEMANTIC_VIDEO_CHAT_TABLE_NAME = var.dynamodb_table_name
      S3_VIDEO_BUCKET_NAME           = var.s3_video_bucket_name
      OPENAI_SECRET_ARN              = var.openai_secret_arn
    }
  }

  tags = var.tags
}

resource "aws_lambda_event_source_mapping" "transcription_mapping" {
  event_source_arn = var.sqs_trigger
  function_name    = aws_lambda_function.transcription-function.arn
}

resource "aws_iam_role" "function_role" {
  name = "${local.function_name}-function-role"

  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "function_policy" {
  name = "${local.function_name}-function-policy"
  role = aws_iam_role.function_role.id
  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Effect : "Allow",
        Action : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource : "arn:aws:logs:*:*:*"
      },
      {
        Effect : "Allow",
        Action : [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ],
        Resource : var.sqs_trigger
      },
      {
        Effect : "Allow",
        Action : [
          "sqs:SendMessage"
        ],
        Resource : var.sqs_output
      },
      {
        Effect : "Allow",
        Action : [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
        ],
        Resource : var.dynamodb_table_arn
      },
      {
        Effect : "Allow",
        Action : [
          "secretsmanager:GetSecretValue"
        ],
        Resource : [
          var.openai_secret_arn,
          var.langsmith_secret_arn
        ],
      },
      {
        Effect : "Allow",
        Action : [
          "s3:GetObject",
          "s3:PutObject"
        ],
        Resource : "${var.s3_video_bucket_arn}/*"
      }
    ]
  })
}
