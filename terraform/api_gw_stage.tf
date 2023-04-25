# Stage Deployment - Stages works as a version of your API. You can have multiple stages for the same API.
resource "aws_api_gateway_deployment" "stage_v1" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = var.STAGE_NAME
  depends_on = [
    aws_api_gateway_integration.options,
    aws_api_gateway_integration_response.options,
    aws_api_gateway_integration.any_to_lambda
  ]
}
