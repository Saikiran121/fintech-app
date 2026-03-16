terraform {
  backend "s3" {
    bucket       = "saikiran-s3-demo-v1.0"
    key          = "eks/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}