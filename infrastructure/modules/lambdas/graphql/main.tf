data "aws_caller_identity" "current" {}

locals {
  function_name        = "${var.application_name}-${var.environment}-graphql"
  function_handler     = "index.handler"
  function_runtime     = "nodejs20.x"
  function_timeout     = 30
  function_memory_size = 512
  function_zip         = "../apps/graphql/dist/lambda.zip"
}

resource "aws_lambda_function" "graphql-function" {
  function_name = local.function_name
  handler       = local.function_handler
  runtime       = local.function_runtime
  timeout       = local.function_timeout

  filename         = local.function_zip
  source_code_hash = filebase64sha256(local.function_zip)

  role = aws_iam_role.function_role.arn

  memory_size = local.function_memory_size

  environment {
    variables = {
      ENVIRONMENT                    = var.environment
      TRANSCRIPTIONS_SQS_QUEUE_ARN   = var.sqs_output
      CHATS_LAMBDA_ARN               = var.chats_lambda_arn
      SEMANTIC_VIDEO_CHAT_TABLE_NAME = var.dynamodb_table_name
      S3_VIDEO_BUCKET_NAME           = var.s3_video_bucket_name
    }
  }

  tags = var.tags
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
          "sqs:SendMessage"
        ],
        Resource : var.sqs_output
      },
      {
        Effect : "Allow",
        Action : [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        Resource : [
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*"
        ]
      },
      {
        Effect : "Allow",
        Action : [
          "s3:GetObject",
          "s3:PutObject"
        ],
        Resource : "${var.s3_video_bucket_arn}/*"
      },
      {
        Effect : "Allow",
        Action : [
          "lambda:InvokeFunction"
        ],
        Resource : var.chats_lambda_arn
      }
    ]
  })
}
