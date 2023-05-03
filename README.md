# setup-openmodelica Action

[![build-test](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/test.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/test.yml)
[![Check dist/](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/check-dist.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/codeql-analysis.yml)

This action sets up the [OpenModelica Compiler](https://openmodelica.org/) `omc` for use in
actions on Linux and Windows runners.
On Linux apt is used to install OpenModelica, on Windows the installer executable is used.

## Usage

### Inputs

- `version`: Version of OpenModelica to install.
  - For example
    `'nightly'`, `'stable'`, `'release'`, `'1.18'` or `'1.18.0'`.
- `architecture`: Choose between 64 and 32 bit architecture.
                  Can be `'64'` or `'32'`.
- `packages`: OpenModelica APT packages to install. Only used on Linux OS.
  - For example `'omc'` for the OpenModelica Compiler or `'omsimulator'` for OMSimulator.
    Use one package per line.

## Available OpenModelica versions

| Version      | OS      | Arch                      | Available |
|--------------|---------|---------------------------|-----------|
| nightly      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| stable       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| release      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
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
| nightly      | Windows | 64bit                     | ✔️       |
| stable       | Windows | 64bit                     | ✔️       |
| release      | Windows | 64bit                     | ✔️       |
| 1.21.0       | Windows | 64bit                     | ✔️       |
| 1.20.0       | Windows | 64bit                     | ✔️       |
| 1.19.2       | Windows | 64bit                     | ✔️       |
| 1.19.0       | Windows | 64bit                     | ☑️       |
| 1.18.1       | Windows | 64bit                     | ☑️       |
| 1.18.0       | Windows | 64bit                     | ☑️       |
| 1.17.0       | Windows | 64bit                     | ☑️       |
| all          | Windows | 32bit                     | ❌       |
| all          | Mac     | all                       | ❌       |

✔️: Available
☑️: Available, but untested
❌: Not available

## Examples

```yaml
- uses: AnHeuermann/setup-openmodelica@v0.4
  with:
    version: '1.20'
    packages: |
      'omc'
      'omsimulator'
```

```yaml
- uses: AnHeuermann/setup-openmodelica@v0.4
  with:
    version: 'nightly'
```

```yaml
- uses: AnHeuermann/setup-openmodelica@v0.4
  with:
    version: 'stable'
```

## Known Limitations

- This action is very slow, especially on Windows, see [issue #36](https://github.com/AnHeuermann/setup-openmodelica/issues/36).
- Macos runners are not supported, because OpenModelica discontinued the Mac builds after version 1.16.
  It should be possible to build/install latest OpenModelica nightly for macOS,
  see [this README](https://github.com/OpenModelica/OpenModelica/blob/master/README.cmake.md#33-macos).
- OPENMODELICA home environment variable is only set on Windows. If you need it on Linux as well open an issue.

## Developing this action

There is a dockerfile in [.ci/dockerfile](.ci/dockerfile) one can use for developing on Windows 10,
so the installer won't mess with the host system.

To build and test run:

```bash
$ npm install
$ npm run build
$ npm run package
$ npm test
```

## Acknowledgments

This package was developed as part of the [Proper Hybrid Models for Smarter Vehicles (PHyMoS)](https://phymos.de/en/) project,
supported by the German [Federal Ministry for Economic Affairs and Climate Action](https://www.bmwk.de/Navigation/EN/Home/home.html)
with project number 19|200022G.
