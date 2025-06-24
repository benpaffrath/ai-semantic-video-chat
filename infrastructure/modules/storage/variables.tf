variable "domain_name" {
  description = "Domain name for CloudFront"
  type        = string
  default     = null
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
}