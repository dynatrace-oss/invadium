param([Parameter(Mandatory=$true)][String]$SourcePath)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$NAMESPACE = "invadium"
$SELECTOR = "app.kubernetes.io/component=backend,app.kubernetes.io/part-of=invadium"
$ENDPOINT = "http://localhost:3001/api/config/refresh"

# wait for backend rollout
$DEPLOYMENT = kubectl get deployment --no-headers -o custom-columns=":metadata.name" -n ${NAMESPACE} --selector=${SELECTOR}
kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE} --timeout 30s
if (-not $?) { throw "timed-out waiting for deployment/${DEPLOYMENT} to be ready" }

# retrieve pod name for deployment
$POD = kubectl get pods --no-headers -o custom-columns=":metadata.name" -n ${NAMESPACE} --selector=${SELECTOR}
$TARGET = "${POD}:/"

# overwrite target directory
kubectl exec ${POD} -n ${NAMESPACE} -- /bin/sh -c "rm -f /config/*"
kubectl cp ${SourcePath} ${TARGET} -n ${NAMESPACE}
if (-not $?) { throw "failed copying data from ${SourcePath} to ${TARGET}" }
Write-Host "copied data from ""${SourcePath}"" to ""${TARGET}"" successfully"

# invoke config refresh
kubectl exec -n ${NAMESPACE} $POD -- python -c "from urllib import request; req = request.Request('${ENDPOINT}', method='POST'); print(request.urlopen(req).read().decode());"
