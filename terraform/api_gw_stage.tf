# Stage Deployment - Stages works as a version of your API. You can have multiple stages for the same API.
resource "aws_api_gateway_deployment" "stage_v2" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = var.STAGE_NAME
}

resource "aws_cloudwatch_log_group" "stage_v2" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.api.id}/${aws_api_gateway_deployment.stage_v2.stage_name}"
  retention_in_days = 7
}

resource "aws_api_gateway_stage" "stage_v2" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = aws_api_gateway_deployment.stage_v2.stage_name
  deployment_id = aws_api_gateway_deployment.stage_v2.id
  depends_on = [
    aws_api_gateway_integration.options,
    aws_api_gateway_integration_response.options,
    aws_api_gateway_integration.any_to_lambda
  ]

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.stage_v2.arn

    format = jsonencode({
      "requestId" : "$context.requestId",
      "ip" : "$context.identity.sourceIp",
      "requestTime" : "$context.requestTime",
      "httpMethod" : "$context.httpMethod",
      "resourcePath" : "$context.resourcePath",
      "status" : "$context.status",
      "protocol" : "$context.protocol",
      "responseLength" : "$context.responseLength",
      "userAgent" : "$context.identity.userAgent",
      "requestHeaders" : "$input.params().header",
      "responseHeaders" : "$input.params().header",
    })
  }
}
