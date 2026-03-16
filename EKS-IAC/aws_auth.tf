provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(
    data.aws_eks_cluster.cluster.certificate_authority[0].data
  )
  token = data.aws_eks_cluster_auth.cluster.token
}

resource "kubernetes_config_map_v1" "aws_auth" {

  metadata {
    name      = "aws-auth"
    namespace = "kube-system"
  }

  data = {
    mapRoles = yamlencode([
      {
        rolearn  = aws_iam_role.eks_node_role.arn
        username = "system:node:{{EC2PrivateDNSName}}"
        groups = [
          "system:bootstrappers",
          "system:nodes"
        ]
      }
    ])

    mapUsers = yamlencode([
      {
        userarn  = "arn:aws:iam::123456789012:user/admin"
        username = "admin"
        groups = [
          "system:masters"
        ]
      }
    ])
  }

  depends_on = [
    aws_eks_node_group.fintech_eks_node_group
  ]
}