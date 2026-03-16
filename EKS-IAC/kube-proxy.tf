resource "aws_eks_addon" "kube_proxy" {
  cluster_name = aws_eks_cluster.fintech_eks_cluster.name
  addon_name   = "kube-proxy"

  depends_on = [
    aws_eks_node_group.fintech_eks_node_group
  ]
}