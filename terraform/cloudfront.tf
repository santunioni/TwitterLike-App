resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = local.NAME
  price_class         = "PriceClass_100"
  default_root_object = "index.html"

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["BR"]
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.COMMON_TAGS

  origin {
    domain_name = replace(aws_api_gateway_deployment.stage_v1.invoke_url, "/^https?://([^/]*).*/", "$1")
    origin_id   = "apigw"
    origin_path = aws_api_gateway_deployment.stage_v1.stage_name

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "apigw"

    default_ttl = 0
    min_ttl     = 0
    max_ttl     = 0

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.website.id
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.website.id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "allow-all"
  }
}

resource "aws_cloudfront_cache_policy" "api_cache" {
  name    = "api_cache"
  comment = "API Cache Policy"

  default_ttl = 7
  max_ttl     = 10
  min_ttl     = 5

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    enable_accept_encoding_brotli = false
    enable_accept_encoding_gzip   = false
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}


locals {
  WEBSITE_URL = "https://${aws_cloudfront_distribution.website.domain_name}"
}
