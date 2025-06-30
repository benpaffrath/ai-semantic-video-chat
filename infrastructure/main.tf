provider "aws" {
  alias   = "default"
  profile = var.aws_profile
  region  = var.region
}

provider "aws" {
  alias   = "us-east-1"
  profile = var.aws_profile
  region  = "us-east-1"
}

locals {
  environment         = terraform.workspace == "default" ? "production" : terraform.workspace
  domain_name         = terraform.workspace == "default" ? "${var.application_name}.realyte.digital" : "${terraform.workspace}.${var.application_name}.realyte.digital"
  pinecone_index_name = "semantic-video-chat"
  tags = {
    ApplicationName = var.application_name
    Environment     = local.environment
  }
}

module "transcription" {
  source               = "./modules/lambdas/transcription"
  aws_region           = var.region
  application_name     = var.application_name
  environment          = local.environment
  domain_name          = local.domain_name
  sqs_trigger          = module.sqs.sqs_transcription_queue_arn
  sqs_output           = module.sqs.sqs_embeddings_queue_arn
  sqs_output_url       = module.sqs.sqs_embeddings_queue_url
  dynamodb_table_arn   = module.database.dynamodb_table_arn
  dynamodb_table_name  = module.database.dynamodb_table_name
  openai_secret_arn    = module.secrets.openai_secret_arn
  langsmith_secret_arn = module.secrets.langsmith_secret_arn
  s3_video_bucket_arn  = module.storage.s3_video_bucket_arn
  s3_video_bucket_name = module.storage.s3_video_bucket_name
  ffmpeg_layer_arn     = module.layers.ffmpeg_layer_arn
  langchain_layer_arn  = module.layers.langchain_layer_arn
  tags                 = local.tags
}

module "embeddings" {
  source               = "./modules/lambdas/embeddings"
  aws_region           = var.region
  application_name     = var.application_name
  environment          = local.environment
  domain_name          = local.domain_name
  sqs_trigger          = module.sqs.sqs_embeddings_queue_arn
  dynamodb_table_arn   = module.database.dynamodb_table_arn
  dynamodb_table_name  = module.database.dynamodb_table_name
  openai_secret_arn    = module.secrets.openai_secret_arn
  pinecone_secret_arn  = module.secrets.pinecone_secret_arn
  langsmith_secret_arn = module.secrets.langsmith_secret_arn
  s3_video_bucket_arn  = module.storage.s3_video_bucket_arn
  s3_video_bucket_name = module.storage.s3_video_bucket_name
  pinecone_index_name  = local.pinecone_index_name
  langchain_layer_arn  = module.layers.langchain_layer_arn
  tags                 = local.tags
}

module "chats" {
  source               = "./modules/lambdas/chats"
  aws_region           = var.region
  application_name     = var.application_name
  environment          = local.environment
  domain_name          = local.domain_name
  openai_secret_arn    = module.secrets.openai_secret_arn
  pinecone_secret_arn  = module.secrets.pinecone_secret_arn
  langsmith_secret_arn = module.secrets.langsmith_secret_arn
  pinecone_index_name  = local.pinecone_index_name
  tags                 = local.tags
}

module "graphql" {
  source               = "./modules/lambdas/graphql"
  aws_region           = var.region
  application_name     = var.application_name
  environment          = local.environment
  domain_name          = local.domain_name
  sqs_output           = module.sqs.sqs_transcription_queue_arn
  sqs_output_url       = module.sqs.sqs_transcription_queue_url
  dynamodb_table_arn   = module.database.dynamodb_table_arn
  dynamodb_table_name  = module.database.dynamodb_table_name
  s3_video_bucket_arn  = module.storage.s3_video_bucket_arn
  s3_video_bucket_name = module.storage.s3_video_bucket_name
  chats_lambda_arn     = module.chats.chats_lambda_arn
  tags                 = local.tags
}

module "layers" {
  source           = "./modules/layers"
  application_name = var.application_name
  environment      = local.environment
  tags             = local.tags
}

module "hosting" {
  source           = "./modules/hosting"
  aws_region       = var.region
  application_name = var.application_name
  environment      = local.environment
  domain_name      = local.domain_name
  route53_zone_id  = var.route53_zone_id
  tags             = local.tags
}

module "storage" {
  source      = "./modules/storage"
  domain_name = local.domain_name
  tags        = local.tags
}

module "api" {
  source                    = "./modules/api"
  domain_name               = local.domain_name
  application_name          = var.application_name
  environment               = local.environment
  graphql_lambda_invoke_uri = module.graphql.graphql_lambda_invoke_uri
  graphql_lambda_arn        = module.graphql.graphql_lambda_arn
  tags                      = local.tags
}

module "sqs" {
  source           = "./modules/sqs"
  application_name = var.application_name
  environment      = local.environment
  tags             = local.tags
}

module "database" {
  source           = "./modules/database"
  application_name = var.application_name
  environment      = local.environment
  tags             = local.tags
}

module "secrets" {
  source           = "./modules/secrets"
  application_name = var.application_name
  environment      = local.environment
  tags             = local.tags
}
