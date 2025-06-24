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

variable "route53_zone_id" {
  description = "The ID of the existing Route 53 Hosted Zone"
  type        = string
}

variable "tags" {
    description = "A map of tags to add to all resources"
    type        = map(string)
}