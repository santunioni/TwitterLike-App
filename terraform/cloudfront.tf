resource "aws_cloudfront_distribution" "website" {

  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.website.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = local.NAME
  price_class         = "PriceClass_100"
  default_root_object = "index.html"

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

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]
    cached_methods         = ["GET"]
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = ""

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]
      cookies {
        forward = "none"
      }
    }
    target_origin_id = aws_api_gateway_rest_api.api.execution_arn
  }

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
