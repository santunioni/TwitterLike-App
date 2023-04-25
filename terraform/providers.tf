terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "santunioni-iac-state"
    region         = "us-east-1"
    dynamodb_table = "santunioni-iac-state-lock"
    key            = "realworld-app/server.tfstate"
  }
}
