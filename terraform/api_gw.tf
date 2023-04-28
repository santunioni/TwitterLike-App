# API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name                     = local.NAME
  description              = "API for ${local.NAME}"
  binary_media_types       = ["*/*"]
  minimum_compression_size = 0
  tags                     = local.COMMON_TAGS

}

resource "aws_iam_role" "api_gateway_logs_role" {
  name = "api-gateway-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "api_gateway_logs_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
  role       = aws_iam_role.api_gateway_logs_role.name
}

resource "aws_iam_policy" "api_gateway_log_delivery_policy" {
  name        = "api-gateway-log-delivery-policy"
  description = "Policy for API Gateway to deliver logs to CloudWatch Logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "api_gateway_log_delivery_policy_attachment" {
  policy_arn = aws_iam_policy.api_gateway_log_delivery_policy.arn
  role       = aws_iam_role.api_gateway_logs_role.name
}

resource "aws_api_gateway_account" "account" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_logs_role.arn
}
