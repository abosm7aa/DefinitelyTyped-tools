# @definitelytyped/utils

Common utilities shared between DefinitelyTyped tools. Mostly extracted from [types-publisher](https://github.com/microsoft/types-publisher).

The package centralizes small helpers used across the monorepo for:

- safe JSON parsing and package-name normalization
- filesystem and path helpers
- logging and process execution wrappers
- crash-recovery worker orchestration for long-running tasks

## Testing

```sh
pnpm test packages/utils
```
