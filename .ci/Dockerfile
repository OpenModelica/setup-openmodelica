FROM mcr.microsoft.com/windows:2004

ARG NODE_URL="https://nodejs.org/dist/v20.9.0/node-v20.9.0-x64.msi"

RUN powershell Invoke-WebRequest -Uri $env:NODE_URL -OutFile node.msi
RUN powershell Start-Process MsiExec.exe -Wait -ArgumentList '/i node.msi /qn'
