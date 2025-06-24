terraform {
  required_providers {
    tls = {
      source  = "hashicorp/tls"
      version = "~> 3.1"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.25.0"
    }
  }
  required_version = ">= 1.1.0"
}

terraform {
  backend "s3" {
    bucket  = "terraform-application-states"
    key     = "semantic-video-chat-terraform.tfstate"
    region  = "eu-central-1"
    encrypt = true
  }
}