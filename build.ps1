
$WorkspaceRoot = $PSScriptRoot
$Wheels = "$WorkspaceRoot/.wheels"

mkdir "$Wheels" -Force
cd $WorkspaceRoot

pip wheel './backend' --wheel-dir "$Wheels" --no-deps