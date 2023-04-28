variable "DATABASE_URL" {
  description = "The database url"
  type        = string
}


variable "STAGE_NAME" {
  description = "The stage name"
  type        = string
  default     = "v2"
}

variable "PSCALE_DB_NAME" {
  description = "The PlanetScale database name"
  type        = string
  default     = "realworld-app"
}

variable "PSCALE_ORG_NAME" {
  description = "The PlanetScale organization name"
  type        = string
  default     = "santunioni"
}

data "external" "git_sha" {
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
  ENVIRONMENT = terraform.workspace == "default" ? "main" : terraform.workspace
  COMMON_TAGS = {
    Environment = local.ENVIRONMENT
    RepoLink    = "https://github.com/santunioni/realworld-app"
  }
  NAME               = "realworld-api-${local.ENVIRONMENT}"
  API_GATEWAY_DOMAIN = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com"
  BASE_URL           = "${local.API_GATEWAY_DOMAIN}/${var.STAGE_NAME}"
}
