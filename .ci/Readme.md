# Windows CI

## Windows Dockerfile for building and testing

There is a [dockerfile](./dockerfile) available to install Node in so it's easy
to build and test the package without messing with your host system.

1. Build container

   ```powershell
   docker build -t windows-node .
   ```

2. Run image

   ```powershell
   cd ..
   docker run --rm -it -v C:\path\to\setup-openmodelica:C:\setup-openmodelica windows-node powershell
   ```
