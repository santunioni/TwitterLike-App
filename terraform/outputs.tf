output "FUNCTION_NAME" {
  value = aws_lambda_function.realworld_api_function.function_name
}

output "API_BASE_URL" {
  value = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "WEBSITE_ENDPOINT" {
  value = local.WEBSITE_URL
}

output "DATABASE_URL" {
  value = var.DATABASE_URL
}

output "WEBSITE_BUCKET" {
  value = aws_s3_bucket.website.bucket
}

output "API_INVOKE_URL" {
  value = aws_api_gateway_deployment.stage_v1.invoke_url
}
