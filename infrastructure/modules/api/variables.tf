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

variable "graphql_lambda_arn" {
  description = "The arn of the graphql lambda"
  default     = ""
}

variable "graphql_lambda_invoke_uri" {
  description = "The invoke uri of the graphql lambda"
  default     = ""
}

variable "tags" {
    description = "A map of tags to add to all resources"
    type        = map(string)
}