#!/bin/bash
set -e

if [ $# -eq 0 ]
  then echo "please supply the source target directory as an argument to this script" && exit 1
fi

NAMESPACE=invadium
SELECTOR=app.kubernetes.io/component=backend,app.kubernetes.io/part-of=invadium
ENDPOINT=http://localhost:3001/api/config/refresh

# wait for backend rollout
DEPLOYMENT=$(kubectl get deployment --no-headers -o custom-columns=":metadata.name" -n ${NAMESPACE} --selector=${SELECTOR})
kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE} --timeout 30s

# retrieve pod name for deployment
POD=$(kubectl get pods --no-headers -o custom-columns=":metadata.name" -n ${NAMESPACE} --selector=${SELECTOR})
TARGET="${POD}:/"

# overwrite target directory
kubectl exec ${POD} -n ${NAMESPACE} -- /bin/sh -c "rm -f /config/*"
kubectl cp $1 ${TARGET} -n ${NAMESPACE}
echo "copied data from \"$1\" to \"${TARGET}\" successfully"

# invoke config refresh
kubectl exec -n ${NAMESPACE} $POD -- python -c "from urllib import request; req = request.Request('${ENDPOINT}', method='POST'); print(request.urlopen(req).read().decode());"
