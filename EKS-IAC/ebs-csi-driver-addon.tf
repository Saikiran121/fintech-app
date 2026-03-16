resource "aws_eks_addon" "ebs_csi_driver" {
  cluster_name = aws_eks_cluster.fintech_eks_cluster.name
  addon_name   = "aws-ebs-csi-driver"

  depends_on = [
    aws_eks_node_group.fintech_eks_node_group
  ]
}