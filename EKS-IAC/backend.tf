terraform {
  backend "s3" {
    bucket         = "fintech-s3-latest"
    key            = "eks/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}