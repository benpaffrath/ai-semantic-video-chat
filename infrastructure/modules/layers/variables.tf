variable "environment" {
  description = "The environment to deploy to"
  default     = "dev"
}

variable "application_name" {
  description = "The name of the application"
  default     = ""
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
}