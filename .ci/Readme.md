# Windows CI

## Windows Dockerfile for building and testing

There is a [dockerfile](./dockerfile) available to install Node in so it's easy
to build and test the package without messing with your host system.

1. Download [Node.js installer](https://nodejs.org/en/download/) (msi, 64bit).
2. Update `COPY` in line 3 of [dockerfile](./dockerfile)
3. Build container

   ```powershell
   docker build -t windows-node .
   ```

4. Run image

   ```powershell
   cd ..
   docker run --rm -it -v $(pwd):C:\setup-openmodelica windows-node powershell
   ```
