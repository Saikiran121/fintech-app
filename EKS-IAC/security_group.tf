resource "aws_security_group" "eks_security_group" {
  name        = "eks-security-group"
  description = "Security group for EKS cluster"
  vpc_id      = aws_vpc.eks_vpc.id

  tags = {
    Name = "eks-security-group"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_https_ipv4" {
  security_group_id = aws_security_group.eks_security_group.id
  cidr_ipv4           = "0.0.0.0/0"
  from_port           = 443
  to_port             = 443
  ip_protocol         = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "allow_https_ipv6" {
  security_group_id = aws_security_group.eks_security_group.id
  cidr_ipv6           = "::/0"
  from_port           = 443
  to_port             = 443
  ip_protocol         = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "eks_node_internal" {
  security_group_id            = aws_security_group.eks_security_group.id
  referenced_security_group_id = aws_security_group.eks_security_group.id
  ip_protocol                  = "-1"
}

resource "aws_vpc_security_group_ingress_rule" "eks_dns_tcp" {
  security_group_id = aws_security_group.eks_security_group.id
  cidr_ipv4         = aws_vpc.eks_vpc.cidr_block
  from_port         = 53
  to_port           = 53
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "eks_dns_udp" {
  security_group_id = aws_security_group.eks_security_group.id
  cidr_ipv4         = aws_vpc.eks_vpc.cidr_block
  from_port         = 53
  to_port           = 53
  ip_protocol       = "udp"
}

resource "aws_vpc_security_group_egress_rule" "eks_all_outbound_ipv4" {
  security_group_id = aws_security_group.eks_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_vpc_security_group_egress_rule" "eks_all_outbound_ipv6" {
  security_group_id = aws_security_group.eks_security_group.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "-1"
}