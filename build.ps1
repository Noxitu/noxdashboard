
$WorkspaceRoot = $PSScriptRoot
$Wheels = "$WorkspaceRoot/.wheels"

mkdir "$Wheels" -Force
cd $WorkspaceRoot

python -m pip wheel './backend' --wheel-dir "$Wheels" --no-deps