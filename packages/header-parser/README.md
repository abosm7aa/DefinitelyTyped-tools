# DefinitelyTyped Header Parser

This library validates and extracts metadata from DefinitelyTyped package manifests.
Its name is left over from when package information was stored in textual headers.

The parser enforces the conventions used by `@types/*` packages, including `tsX.Y` folder layout, `minimumTypeScriptVersion`, owners, projects, licenses, and dependency constraints.

## Typical usage

```ts
import { validatePackageJson, getTypesVersions } from "@definitelytyped/header-parser";

const header = validatePackageJson("react", packageJson, getTypesVersions("./types/react"));
```

## Contributing

To build: `pnpm run build`.
To test: `pnpm test`.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
