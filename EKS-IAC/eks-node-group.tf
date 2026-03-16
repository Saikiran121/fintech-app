resource "aws_eks_node_group" "fintech_eks_node_group" {
  cluster_name    = aws_eks_cluster.fintech_eks_cluster.name
  node_group_name = "fintech-eks-node-group"
  node_role_arn   = aws_iam_role.eks_node_role.arn

  subnet_ids = [
    aws_subnet.eks_vpc_private_subnet_1.id,
    aws_subnet.eks_vpc_private_subnet_2.id
  ]

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  disk_size = 90

  depends_on = [
    aws_iam_role_policy_attachment.worker_node_policy,
    aws_iam_role_policy_attachment.ecr_read_policy,
    aws_iam_role_policy_attachment.cni_policy
  ]

  tags = {
    Name = "fintech-eks-node-group"
  }
}