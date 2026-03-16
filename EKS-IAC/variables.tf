variable "region" {
  type = string
  default = "ap-south-1"
}

variable "vpc_cidr_block" {
  type = string
  default = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  type = string
  default = "10.0.0.0/24"
}

variable "public_subnet_2_cidr" {
  type = string
  default = "10.0.1.0/24"
}

variable "private_subnet_1_cidr" {
  type = string
  default = "10.0.2.0/24"
}

variable "private_subnet_2_cidr" {
  type = string
  default = "10.0.3.0/24"
}