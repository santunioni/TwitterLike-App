output "FUNCTION_NAME" {
  value = aws_lambda_function.realworld_api_function.function_name
}

output "API_BASE_URL" {
  value = aws_api_gateway_deployment.stage_v1.invoke_url
}

output "NEXT_PUBLIC_API_BASE_URL" {
  value = aws_api_gateway_deployment.stage_v1.invoke_url
}

output "WEBSITE_DESTINATION" {
  value = "s3://${aws_s3_bucket_website_configuration.website.bucket}/"
}

output "WEBSITE_ENDPOINT" {
  value = "http://${aws_s3_bucket_website_configuration.website.website_endpoint}"
}

output "DATABASE_URL" {
  value = var.DATABASE_URL
}
