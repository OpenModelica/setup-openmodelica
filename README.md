# setup-openmodelica Action

[![build-test](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/test.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/test.yml)
[![Check dist/](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/check-dist.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/codeql-analysis.yml)

This action sets up the [OpenModelica Compiler](https://openmodelica.org/) `omc` for use in actions.

At the moment only Linux OS using advanced package manager apt are supported. There apt is used to install `omc`.

## Usage

### Inputs

- `version`: Version of OpenModelica to install.
  - For example
    `'nightly'`, `'stable'`, `'release'`, `'1.18'` or `'1.18.0'`.
- `architecture`: Choose between 64 and 32 bit architecture.
                  Can be `'64'` or `'32'`.

## Available OpenModelica versions

| Version      | OS      | Arch                      | Available |
|--------------|---------|---------------------------|-----------|
| nightly      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| stable       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| release      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.19.2       | Linux   | amd64, arm64, armhf, i386 | ❌       |
| 1.19.1       | Linux   | amd64, arm64, armhf, i386 | ❌       |
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
| nightly      | Windows | x86_x64                   | ☑️       |
| stable       | Windows | x86_x64                   | ☑️       |
| release      | Windows | x86_x64                   | ☑️       |
| 1.19.2       | Windows | x86_x64                   | ✔️       |
| 1.19.0       | Windows | x86_x64                   | ☑️       |
| 1.18.1       | Windows | x86_x64                   | ☑️       |
| 1.18.0       | Windows | x86_x64                   | ☑️       |
| 1.17.0       | Windows | x86_x64                   | ☑️       |
| all          | Windows | i386                      | ❌       |
| all          | Mac     | all                       | ❌       |

✔️: Available
☑️: Available, but untested
❌: Not available

## Examples

```yaml
- uses: AnHeuermann/setup-openmodelica@main
  with:
    version: '1.18'
```

```yaml
- uses: AnHeuermann/setup-openmodelica@main
  with:
    version: 'nightly'
```

```yaml
- uses: AnHeuermann/setup-openmodelica@main
  with:
    version: 'stable'
```

## Developing this action

There is a dockerfile in [.ci/dockerfile](.ci/dockerfile) one can use for developing on Windows 10,
so the installer won't mess with the host system.

To build and test run

```bash
$ npm install
$ npm run build
$ npm run package
$ npm test
```
