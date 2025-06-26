resource "aws_lambda_layer_version" "langchain_layer" {
  filename            = "../shared/layers/langchain/dist/layer.zip"
  layer_name          = "${var.application_name}-${var.environment}-langchain-layer"
  compatible_runtimes = ["python3.9", "python3.10", "python3.11"]
  description         = "LangChain Layer"
  source_code_hash    = filebase64sha256("../shared/layers/langchain/dist/layer.zip")
}

resource "aws_lambda_layer_version" "ffmpeg_layer" {
  filename            = "../shared/layers/ffmpeg/dist/layer.zip"
  layer_name          = "${var.application_name}-${var.environment}-ffmpeg-layer"
  compatible_runtimes = ["python3.9", "python3.10", "python3.11"]
  description         = "ffmpeg Layer"
  source_code_hash    = filebase64sha256("../shared/layers/ffmpeg/dist/layer.zip")
}
