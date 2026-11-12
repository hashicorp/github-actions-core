# Shared Code for GitHub Actions

Core functions for use with [@hashicorp](https://github.com/hashicorp/) GitHub Actions.

## Table of Contents

- [Shared Code for GitHub Actions](#shared-code-for-github-actions)
  - [Table of Contents](#table-of-contents)
  - [Development and packaging](#development-and-packaging)
  - [Author Information](#author-information)
  - [License](#license)

## Development and packaging

Use Node.js 24 to build and test this package:

```sh
npm ci
npm test
```

The `prepare` script builds unbundled JavaScript and TypeScript declarations in
`dist/` during local installation, packing, and Git dependency installation.
Generated files are not committed. Runtime dependencies remain external so
consuming actions can apply their own dependency overrides.

The package test packs a clean source copy and checks that its JavaScript and type
entry points are included and the public API can be imported.

## Author Information

This module is maintained by the contributors listed on [GitHub](https://github.com/hashicorp/github-actions-core/graphs/contributors).

## License

Licensed under the Apache License, Version 2.0 (the "License").

You may obtain a copy of the License at [apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an _"AS IS"_ basis, without WARRANTIES or conditions of any kind, either express or implied.

See the License for the specific language governing permissions and limitations under the License.
