resource "aws_vpc" "eks_vpc" {
  cidr_block = var.vpc_cidr_block
  instance_tenancy = "default"

  tags = {
    Name = "eks-vpc"
  }
}

resource "aws_subnet" "eks_vpc_public_subnet_1" {
  vpc_id = aws_vpc.eks_vpc.id
  cidr_block = var.public_subnet_1_cidr
  map_public_ip_on_launch = true

  tags = {
    Name = "eks-vpc-public-subnet-1" 
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/eks-cluster" = "shared"
  }
}

resource "aws_subnet" "eks_vpc_public_subnet_2" {
  vpc_id = aws_vpc.eks_vpc.id
  cidr_block = var.public_subnet_2_cidr
  map_public_ip_on_launch = true

  tags = {
    Name = "eks-vpc-public-subnet-2"
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/eks-cluster" = "shared"
  }
}

resource "aws_subnet" "eks_vpc_private_subnet_1" {
  vpc_id = aws_vpc.eks_vpc.id 
  cidr_block = var.private_subnet_1_cidr 

  tags = {
    Name = "eks-vpc-private-subnet-1"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/eks-cluster" = "shared"
  }
}

resource "aws_subnet" "eks_vpc_private_subnet_2" {
  vpc_id = aws_vpc.eks_vpc.id 
  cidr_block = var.private_subnet_2_cidr 

  tags = {
    Name = "eks-vpc-private-subnet-2"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/eks-cluster" = "shared"
  }
}

resource "aws_internet_gateway" "eks_vpc_igw" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name = "eks-vpc-igw"
  }
}

resource "aws_eip" "eks_vpc_eip" {
    tags = {
        Name = "eks-vpc-eip"
    }
}

resource "aws_nat_gateway" "eks_vpc_nat_gateway" {
  subnet_id = aws_subnet.eks_vpc_public_subnet_1.id
  allocation_id = aws_eip.eks_vpc_eip.id

  tags = {
    Name = "eks-vpc-nat-gateway"
  }
}

resource "aws_route_table" "eks_vpc_public_route_table" {
  vpc_id = aws_vpc.eks_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks_vpc_igw.id
  }
}

resource "aws_route_table_association" "eks_vpc_public_subnet_1_route_table_association" {
  subnet_id = aws_subnet.eks_vpc_public_subnet_1.id
  route_table_id = aws_route_table.eks_vpc_public_route_table.id
}

resource "aws_route_table_association" "eks_vpc_public_subnet_2_route_table_association" {
  subnet_id = aws_subnet.eks_vpc_public_subnet_2.id
  route_table_id = aws_route_table.eks_vpc_public_route_table.id
}

resource "aws_route_table" "eks_vpc_private_route_table" {
  vpc_id = aws_vpc.eks_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.eks_vpc_nat_gateway.id
  }
}

resource "aws_route_table_association" "eks_vpc_private_subnet_1_route_table_association" {
  subnet_id = aws_subnet.eks_vpc_private_subnet_1.id
  route_table_id = aws_route_table.eks_vpc_private_route_table.id
}

resource "aws_route_table_association" "eks_vpc_private_subnet_2_route_table_association" {
  subnet_id = aws_subnet.eks_vpc_private_subnet_2.id
  route_table_id = aws_route_table.eks_vpc_private_route_table.id
}