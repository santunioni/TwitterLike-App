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

data "archive_file" "dummy" {
  type        = "zip"
  output_path = "/tmp/lambda.zip"
  source {
    content  = "module.exports = { handler: () => 'This is a dummy function' }"
    filename = "index.js"
  }
}

resource "aws_ssm_parameter" "database_url" {
  name      = "/pscale/${var.PSCALE_ORG_NAME}/${var.PSCALE_DB_NAME}/${local.ENVIRONMENT}/application"
  value     = var.DATABASE_URL
  tier      = "Standard"
  type      = "SecureString"
  overwrite = true
  tags      = local.COMMON_TAGS
}

resource "aws_lambda_function" "realworld_api_function" {
  function_name    = local.NAME
  role             = aws_iam_role.realworld_api_function_role.arn
  filename         = data.archive_file.dummy.output_path
  source_code_hash = filebase64sha256(data.archive_file.dummy.output_path)
  tags             = local.COMMON_TAGS
  provider         = aws
  environment {
    variables = {
      DATABASE_URL         = var.DATABASE_URL
      BASE_URL             = local.BASE_URL
      API_PREFIX           = ""
      VERSION              = data.external.git_sha.result.sha
      CORS_ALLOWED_ORIGINS = join(",", local.CORS_ALLOWED_ORIGINS)
      CORS_ALLOWED_HEADERS = join(",", local.CORS_ALLOWED_HEADERS)
      CORS_ALLOWED_METHODS = join(",", local.CORS_ALLOWED_METHODS)
    }
  }
  handler     = "index.handler"
  runtime     = "nodejs18.x"
  timeout     = 60 * 5
  memory_size = 516
}
