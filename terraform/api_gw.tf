# API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name                     = local.NAME
  description              = "API for ${local.NAME}"
  binary_media_types       = ["*/*"]
  minimum_compression_size = 0
  tags                     = local.COMMON_TAGS
}

output "API_GATEWAY_ID" {
  value = aws_api_gateway_rest_api.api.id
}
