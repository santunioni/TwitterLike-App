output "FUNCTION_NAME" {
  value = aws_lambda_function.realworld_api_function.function_name
}

output "API_BASE_URL" {
  value = aws_api_gateway_deployment.stage_v1.invoke_url
}

output "WEBSITE_ENDPOINT" {
  value = local.WEBSITE_URL
}

output "DATABASE_URL" {
  value = var.DATABASE_URL
}
