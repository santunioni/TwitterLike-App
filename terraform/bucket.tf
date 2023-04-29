resource "aws_s3_bucket" "website" {
  bucket        = "santunioni-${local.NAME}"
  tags          = local.COMMON_TAGS
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    "Statement" : {
      "Sid" : "AllowCloudFrontServicePrincipalReadOnly",
      "Effect" : "Allow",
      "Principal" : {
        "Service" : "cloudfront.amazonaws.com"
      },
      "Action" : "s3:GetObject",
      "Resource" : "${aws_s3_bucket.website.arn}/*",
      "Condition" : {
        "StringEquals" : {
          "AWS:SourceArn" : aws_cloudfront_distribution.website.arn
        }
      }
    }
  })

  depends_on = [aws_s3_bucket_public_access_block.website]
}
