[![build-test](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/test.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/test.yml)
[![Check dist/](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/check-dist.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/codeql-analysis.yml)

# setup-openmodelica Action

This action sets up the [OpenModelica Compiler](https://openmodelica.org/) `omc` for use in actions.
On Ubuntu/Debian apt is used to install `omc`.


## Usage

### Inputs

  - `version`: Version of OpenModelica to install.
               For example `'1.19'` or `'1.19.0'`.
  - `releaseType`: Release type of OpenModelica.
                   Can be `'release'`, `'stable'` or `'nightly'`.
                   When `releaseType` is nightly the version is ignored.
  - `architecture`: Choose between 64 and 32 bit architecture.
                    Can be `'64'` and `'32'`.

## Available OpenModelica versions

| Version      | Release Type | OS      | Arch                      | Available |
|--------------|--------------|---------|---------------------------|-----------|
| 1.20.0-dev   | nightly      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.19.2       | stable       | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.18.1       | release      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.18.0       | release      | Linux   | amd64, arm64, armhf, i386 | ✔️       |
| 1.17.0       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.5       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.4       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.2       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.1       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.16.0       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.14.2       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.14.1       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| 1.13.2       | release      | Linux   | amd64, arm64, armhf, i386 | ☑️       |
| all          | release      | Windows | x86_x64, i386             | ❌       |
| all          | release      | Mac     | all                       | ❌       |

✔️: Available
☑️: Available, but untested
❌: Not available

## Examples
```yaml
- uses: AnHeuermann/setup-openmodelica@v0.2
  with:
    version: '1.19'
```

```yaml
- uses: AnHeuermann/setup-openmodelica@v0.2
  with:
    releaseType: 'nightly'
```
