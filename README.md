# setup-openmodelica Action

[![build-test][build-test-badge]][build-test-link]
[![Check dist/][check-dist-badge]][check-dist-link]
[![CodeQL][codeql-badge]][codeql-link]

This action sets up the [OpenModelica Compiler](https://openmodelica.org/) `omc`
for use in actions on Linux and Windows runners. On Linux apt is used to install
OpenModelica, on Windows the installer executable is used.
Afterwards the OpenModelica Package manager installs Modelica libraries.

## Usage

### Inputs

- `version`: Version of OpenModelica to install.
  - For example `'nightly'`, `'stable'`, `'release'`, `'1.24'` or `'1.24.5'`.
- `architecture`: Choose between 64 and 32 bit architecture. Can be `'64'` or
                  `'32'`.
- `packages`: OpenModelica APT packages to install. Only used on Linux OS.
  - For example `'omc'` for the OpenModelica Compiler or `'omsimulator'` for
    OMSimulator. Use one package per line.
- `libraries`: Modelica libraries to install with the
  [OpenModelica package manager][om-package-manager-link].
  - One library per line with exact version number. Will install exact match
    only and all dependencies.

    ```yml
      libraries: |
        'Modelica 4.0.0'
        'Modelica 3.2.3+maint.om'
    ```

## Available OpenModelica versions

### Linux

| Version      | OS      | Arch                      | Available |
|--------------|---------|---------------------------|-----------|
| nightly      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| stable       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| release      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.25.5       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.25.4       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.25.3       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.25.2       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.25.1       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.25.0       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.24.5       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.23.1       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.23.0       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.22.4       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.22.3       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.22.2       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.22.1       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.22.0       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.21.1       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.20.1       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.20.0       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.19.2       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.19.1       | Linux   | amd64, arm64, armhf, i386 | ❌       |
| 1.19.0       | Linux   | amd64, arm64, armhf, i386 | ❌       |
| 1.18.1       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.18.0       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.17.0       | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.5       | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.4       | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.2       | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.1       | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.0       | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.14.2       | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.14.1       | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.13.2       | Linux   | amd64, arm64, armhf, i386 | ☑️       |

✔️: Available ☑️: Available, but untested ❌: Not available

## Windows

| Version      | OS      | Arch                      | Available |
|--------------|---------|---------------------------|-----------|
| nightly      | Windows | 64bit                     | ✔️       |
| stable       | Windows | 64bit                     | ✔️       |
| release      | Windows | 64bit                     | ✔️       |
| 1.25.5       | Windows | 64bit                     | ✔️       |
| 1.25.4       | Windows | 64bit                     | ✔️       |
| 1.25.3       | Windows | 64bit                     | ✔️       |
| 1.25.2       | Windows | 64bit                     | ✔️       |
| 1.25.1       | Windows | 64bit                     | ✔️       |
| 1.25.0       | Windows | 64bit                     | ✔️       |
| 1.24.5       | Windows | 64bit                     | ✔️       |
| 1.23.1       | Windows | 64bit                     | ✔️       |
| 1.23.0       | Windows | 64bit                     | ✔️       |
| 1.22.3       | Windows | 64bit                     | ✔️       |
| 1.22.2       | Windows | 64bit                     | ✔️       |
| 1.22.1       | Windows | 64bit                     | ✔️       |
| 1.22.0       | Windows | 64bit                     | ✔️       |
| 1.21.0       | Windows | 64bit                     | ✔️       |
| 1.20.0       | Windows | 64bit                     | ✔️       |
| 1.19.2       | Windows | 64bit                     | ✔️       |
| 1.19.0       | Windows | 64bit                     | ☑️       |
| 1.18.1       | Windows | 64bit                     | ☑️       |
| 1.18.0       | Windows | 64bit                     | ☑️       |
| 1.17.0       | Windows | 64bit                     | ☑️       |
| all          | Windows | 32bit                     | ❌       |

✔️: Available ☑️: Available, but untested ❌: Not available

## Mac

Not available.

## Examples

```yaml
- uses: OpenModelica/setup-openmodelica@v1.0
  with:
    version: '1.25.5'
    packages: |
      'omc'
      'omsimulator'
    libraries: |
      'Modelica 4.0.0'
      'Modelica 3.2.3+maint.om'
    omc-diff: true
```

```yaml
- uses: OpenModelica/setup-openmodelica@v1.0
  with:
    version: 'nightly'
```

```yaml
- uses: OpenModelica/setup-openmodelica@v1.0
  with:
    version: 'stable'
```

## Known Limitations

This action can be slow, especially on Windows, see issue [#36][issue-36-link].

- Macos runners are not supported, because OpenModelica discontinued the Mac
  builds after version 1.16. It should be possible to build/install latest
  OpenModelica nightly for macOS, see [this README][macos-readme]:.
- OPENMODELICA home environment variable is only set on Windows. If you need it
  on Linux as well open an issue.

## Developing this action

The tests will install all sorts of OpenModelica versions and tools. To prevent
the installer from messing with your host system use the provided dockerfile or
dev-container:

- Linux: [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json)
- Windows: [.ci/dockerfile](.ci/dockerfile)

To build and test run:

```bash
npm install
npm run build
npm run package
npm test
```

## License

This action is licensed with the OSMC Public License v1.8, see
[OSMC-License.txt](./OSMC-License.txt).

## Acknowledgments

This package was initially developed by
[Hochschule Bielefeld - University of Applied Sciences and Arts](hsbi.de)
as part of the
[Proper Hybrid Models for Smarter Vehicles (PHyMoS)](https://phymos.de/en/)
project, supported by the German
[Federal Ministry for Economic Affairs and Climate Action][bmwk]
with project number `19|200022G`.

[build-test-badge]: https://github.com/OpenModelica/setup-openmodelica/actions/workflows/test.yml/badge.svg "Build Badge"
[build-test-link]: https://github.com/OpenModelica/setup-openmodelica/actions/workflows/test.yml
[check-dist-badge]: https://github.com/OpenModelica/setup-openmodelica/actions/workflows/check-dist.yml/badge.svg "Check dist/ Badge"
[check-dist-link]: https://github.com/OpenModelica/setup-openmodelica/actions/workflows/check-dist.yml
[codeql-badge]: https://github.com/OpenModelica/setup-openmodelica/actions/workflows/codeql-analysis.yml/badge.svg "CodeQL Badge"
[codeql-link]: https://github.com/OpenModelica/setup-openmodelica/actions/workflows/codeql-analysis.yml
[om-package-manager-link]: https://openmodelica.org/doc/OpenModelicaUsersGuide/latest/packagemanager.html
[issue-36-link]: https://github.com/AnHeuermann/setup-openmodelica/issues/36
[macos-readme]: https://github.com/OpenModelica/OpenModelica/blob/master/README.cmake.md#33-macos
[bmwk]: https://www.bmwk.de/Navigation/EN/Home/home.html
