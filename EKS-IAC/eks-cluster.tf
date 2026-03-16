resource "aws_eks_cluster" "fintech_eks_cluster" {
  name     = "fintech-eks-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.29"

  vpc_config {
    subnet_ids         = [aws_subnet.eks_vpc_public_subnet_1.id, aws_subnet.eks_vpc_public_subnet_2.id, aws_subnet.eks_vpc_private_subnet_1.id, aws_subnet.eks_vpc_private_subnet_2.id]
    security_group_ids = [aws_security_group.eks_security_group.id]

    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_controller
  ]

  tags = {
    Name = "fintech-eks-cluster"
  }
}