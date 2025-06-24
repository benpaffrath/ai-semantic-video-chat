variable "region" {
    description = "AWS region"
    type        = string
    default     = "eu-central-1"
}

variable "aws_profile" {
    description = "Name of your AWS profile"
    type        = string
    default     = "default"
}

variable "application_name" {
    description = "Name of the application"
    type        = string
    default     = "semantic-video-chat"
}

variable "domain" {
    description = "Domain name"
    type        = string
    default     = "realyte.digital"
}

variable "route53_zone_id" {
    description = "The ID of the existing Route 53 Hosted Zone"
    type        = string
    default     = "Z0564691IMEN8866O4W"
}