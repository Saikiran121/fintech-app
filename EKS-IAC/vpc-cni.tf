resource "aws_eks_addon" "vpc_cni" {
  cluster_name  = aws_eks_cluster.fintech_eks_cluster.name
  addon_name    = "vpc-cni"


  depends_on = [
    aws_eks_node_group.fintech_eks_node_group
  ]
}