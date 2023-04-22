resource "aws_iam_role" "realworld_api_function_role" {
  name               = local.NAME
  assume_role_policy = <<EOF
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Principal": {
            "Service": "lambda.amazonaws.com"
          },
          "Effect": "Allow",
          "Sid": ""
        }
      ]
    }
EOF
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  ]
  tags     = local.COMMON_TAGS
  provider = aws
}

resource "aws_ssm_parameter" "database_url" {
  name      = "/pscale/${var.PSCALE_ORG_NAME}/${var.PSCALE_DB_NAME}/${terraform.workspace == "default" ? "main" : terraform.workspace}/application"
  value     = var.DATABASE_URL
  tier      = "Standard"
  type      = "SecureString"
  overwrite = true
  tags      = local.COMMON_TAGS
}

resource "aws_lambda_function" "realworld_api_function" {
  function_name = local.NAME
  role          = aws_iam_role.realworld_api_function_role.arn
  tags          = local.COMMON_TAGS
  provider      = aws
  environment {
    variables = {
      DATABASE_URL = aws_ssm_parameter.database_url.value
      BASE_URL     = local.BASE_URL
      API_PREFIX   = ""
      VERSION      = data.external.git.result.sha
    }
  }
  filename         = "${path.module}/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda.zip")
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  timeout          = 60 * 5
  memory_size      = 516
}

output "FUNCTION_NAME" {
  value = aws_lambda_function.realworld_api_function.function_name
}
