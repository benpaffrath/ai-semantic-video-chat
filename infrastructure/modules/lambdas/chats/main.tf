data "aws_caller_identity" "current" {}

locals {
  function_name        = "${var.application_name}-${var.environment}-chats"
  function_handler     = "handler.lambda_handler"
  function_runtime     = "python3.11"
  function_timeout     = 900
  function_memory_size = 512
  function_zip         = "../apps/chats/dist/lambda.zip"
}

resource "aws_lambda_function" "chats-function" {
  function_name = local.function_name
  handler       = local.function_handler
  runtime       = local.function_runtime
  timeout       = local.function_timeout

  filename         = local.function_zip
  source_code_hash = filebase64sha256(local.function_zip)

  role = aws_iam_role.function_role.arn

  layers = [var.langchain_layer_arn]

  memory_size = local.function_memory_size

  environment {
    variables = {
      ENVIRONMENT         = var.environment
      OPENAI_SECRET_ARN   = var.openai_secret_arn
      PINECONE_SECRET_ARN = var.pinecone_secret_arn
      PINECONE_INDEX_NAME = var.pinecone_index_name
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
          "secretsmanager:GetSecretValue"
        ],
        Resource : [
          var.openai_secret_arn,
          var.pinecone_secret_arn,
          var.langsmith_secret_arn
        ]
      }
    ]
  })
}
