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

variable "openai_secret_arn" {
  description = "The ARN of the OpenAI secret"
  default     = ""
}

variable "pinecone_secret_arn" {
  description = "The ARN of the Pinecone secret"
  default     = ""
}

variable "langsmith_secret_arn" {
  description = "The ARN of the LangSmith secret"
  default     = ""
}
