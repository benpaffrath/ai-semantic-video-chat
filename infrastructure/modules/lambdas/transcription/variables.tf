variable "aws_region" {
  description = "The aws region"
  default     = "eu-central-1"
}

variable "environment" {
  description = "The environment to deploy to"
  default     = "dev"
}

variable "application_name" {
  description = "The name of the application"
  default     = ""
}

variable "domain_name" {
  description = "The domain to use in route53"
  default     = ""
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
}

variable "sqs_trigger" {
  description = "The SQS arn to trigger the lambda"
  default     = ""
}

variable "sqs_output" {
  description = "The SQS arn to send events to"
  default     = ""
}

variable "dynamodb_table_arn" {
  description = "The ARN of the DynamoDB"
  default     = ""
}

variable "openai_secret_arn" {
  description = "The ARN of the OpenAI secret"
  default     = ""
}

variable "langsmith_secret_arn" {
  description = "The ARN of the LangSmith secret"
  default     = ""
}

variable "s3_video_bucket_arn" {
  description = "Arn for the s3 storage bucket"
  default     = ""
}

variable "ffmpeg_layer_arn" {
  description = "ffmpeg layer arn"
  default     = ""
}
