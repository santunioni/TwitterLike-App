# OPTIONS are needed for CORS
resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options" {
  depends_on  = [aws_api_gateway_method.options]
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = 200

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"
}

resource "aws_api_gateway_integration_response" "options" {
  depends_on  = [aws_api_gateway_integration.options, aws_api_gateway_method_response.options]
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.options.http_method
  status_code = 200
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", local.CORS_ALLOWED_ORIGINS)}'"
    "method.response.header.Access-Control-Allow-Headers" = "'${join(",", local.CORS_ALLOWED_HEADERS)}'"
    "method.response.header.Access-Control-Allow-Methods" = "'${join(",", local.CORS_ALLOWED_METHODS)}'"
  }
}

locals {
  CORS_ALLOWED_ORIGINS = [local.WEBSITE_URL, "${local.WEBSITE_URL}:80"]
  CORS_ALLOWED_HEADERS = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
  CORS_ALLOWED_METHODS = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
}

resource "aws_api_gateway_gateway_response" "response_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  response_type = "DEFAULT_4XX"

  response_templates = {
    "application/json" = "{'message':$context.error.messageString}"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'${join(",", local.CORS_ALLOWED_ORIGINS)}'"
  }
}

resource "aws_api_gateway_gateway_response" "response_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  response_type = "DEFAULT_5XX"

  response_templates = {
    "application/json" = "{'message':$context.error.messageString}"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'${join(",", local.CORS_ALLOWED_ORIGINS)}'"
  }
}
