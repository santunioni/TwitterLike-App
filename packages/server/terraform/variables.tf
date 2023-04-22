variable "DATABASE_URL" {
  description = "The database url"
  type        = string
}


variable "STAGE_NAME" {
  description = "The stage name"
  type        = string
  default     = "v1"
}

data "external" "git" {
  program = [
    "git",
    "log",
    "--pretty=format:{ \"sha\": \"%H\" }",
    "-1",
    "HEAD"
  ]
}

data "aws_region" "current" {}

locals {
  COMMON_TAGS = {
    Environment = terraform.workspace
    RepoLink    = "https://github.com/santunioni/realworld-app"
  }
  NAME     = "realworld-api-${terraform.workspace}"
  BASE_URL = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.STAGE_NAME}"
}