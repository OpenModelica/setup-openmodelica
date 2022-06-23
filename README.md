[![build-test](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/test.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/test.yml)
[![Check dist/](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/check-dist.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AnHeuermann/setup-openmodelica/actions/workflows/codeql-analysis.yml)

# setup-openmodelica Action

This action sets up the [OpenModelica Compiler](https://openmodelica.org/) `omc` for use in actions.
On Ubuntu/Debian apt is used to install `omc`.


## Usage

### Inputs

```yaml
- uses: AnHeuermann/setup-openmodelica@v1
  with:
    version: '1.19.0'
```

## Available OpenModelica versions

| Version      | Release Type | OS           | Arch       | Available |
|--------------|--------------|--------------|------------|-----------|
| 1.20.0-dev   | nightly      | Ubuntu Focal | amd64      | ❌       |
| 1.19.0       | release      | Ubuntu Focal | amd64      | ✔️       |
| 1.19.0       | release      | Windows 10   | x86_x64    | ❌       |

## Developing this action

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```
### Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

### Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  version: '1.19.0'
```

See the [actions tab](https://github.com/AnHeuermann/setup-openmodelica/actions) for runs of this action! :rocket:

### Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
