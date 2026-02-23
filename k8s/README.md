# Geo-Personalized Content Push: Kubernetes Deployment Guide

## Architecture Overview

The deployment establishes a six-node Kubernetes cluster that emulates a geographically distributed system.

## Deployment Procedure

### 1. Cluster Initialization

Initialize a multi-node Minikube cluster with six nodes to represent the central cloud infrastructure and distributed edge locations:

```bash
minikube start --nodes 6 -p context-aware-cluster --driver=docker
```

### 2. Edge Node Configuration

Configure worker nodes with geographic identifiers and resource isolation policies. Node affinity ensures content repositories are deployed to their designated edge locations, while taints prevent unintended pod scheduling on these specialized resources.

Execute the following configuration block:

```bash
# Birdland Edge Node (m02)
kubectl label nodes context-aware-cluster-m02 area=birdland
kubectl taint nodes context-aware-cluster-m02 dedicated=edge-node:NoSchedule

# Blue Note Edge Node (m03)
kubectl label nodes context-aware-cluster-m03 area=blue-note
kubectl taint nodes context-aware-cluster-m03 dedicated=edge-node:NoSchedule

# Central Park Edge Node (m04)
kubectl label nodes context-aware-cluster-m04 area=central-park
kubectl taint nodes context-aware-cluster-m04 dedicated=edge-node:NoSchedule

# Lincoln Center Edge Node (m05)
kubectl label nodes context-aware-cluster-m05 area=lincoln-center
kubectl taint nodes context-aware-cluster-m05 dedicated=edge-node:NoSchedule

# Village Vanguard Edge Node (m06)
kubectl label nodes context-aware-cluster-m06 area=village-vanguard
kubectl taint nodes context-aware-cluster-m06 dedicated=edge-node:NoSchedule
```

### 3. Container Image Preparation

In multi-node cluster configurations, container images must be explicitly distributed to all nodes. Build the required images locally and load them into the cluster:

```bash
# Build container images
docker build -t geo-app/backend:latest ./backend
docker build -t geo-app/frontend:latest ./frontend
docker build -t geo-app/content-repo:latest ./content-repository

# Distribute images to cluster nodes
minikube -p context-aware-cluster image load geo-app/backend:latest
minikube -p context-aware-cluster image load geo-app/frontend:latest
minikube -p context-aware-cluster image load geo-app/content-repo:latest
```

### 4. Application Deployment

Enable the ingress controller and apply the Kubernetes manifest configurations:

```bash
# Enable ingress functionality
minikube -p context-aware-cluster addons enable ingress

# Deploy application resources
kubectl apply -f k8s
```

### 5. Deployment Verification

Verify correct pod placement across the simulated edge topology:

```bash
kubectl get pods -o wide
```

Examine the NODE column to confirm that each content repository pod is scheduled on its designated node (e.g., `repo-birdland` on `context-aware-cluster-m02`, `repo-blue-note` on `context-aware-cluster-m03`).

### 6. Cluster Termination

To remove the cluster and associated resources:

```bash
minikube -p context-aware-cluster delete
```
