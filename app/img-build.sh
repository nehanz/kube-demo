#!/bin/bash
# run ./img-build.sh v1.0 (version tag is optional, default: latest )

set -e

TAG=${1:-latest}

eval $(minikube docker-env)  # Use minikube's Docker daemon

docker build -t frontend-app:$TAG ./frontend
docker build -t backend-app:$TAG ./backend