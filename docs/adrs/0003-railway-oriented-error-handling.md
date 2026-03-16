---
title: Railway-Oriented Error Handling with Result<T>
version: "0.1.0"
status: draft
date: 2026-03-14
authors:
  - Software Architect
reviewers: []
changelog:
  - version: "0.1.0"
    date: 2026-03-14
    description: Initial draft
---

# 0003. Railway-Oriented Error Handling with Result&lt;T&gt;

**Status:** accepted
**Date:** 2026-03-14
**Deciders:** Software Architect

## Context

The application layer needs an error handling strategy for expected failures (validation errors, not-found, conflicts). .NET's default mechanism is exceptions, but exceptions are expensive for control flow and make the happy path indistinguishable from error paths at the type level.

## Decision

Application handlers return `Result<T>` instead of throwing exceptions for expected failures. `Result<T>` carries either a success value or an `Error` record.

```csharp
public sealed record Error(string Code, string Message);

public class Result<T> : Result
{
    public T Value { get; }           // throws if IsFailure
    public Result<TNext> Map<TNext>(Func<T, TNext> map);
    public Result<T> Ensure(Func<T, bool> predicate, Error error);
    public TResult Match<TResult>(Func<T, TResult> onSuccess, Func<Error, TResult> onFailure);
}
```

The `Error` record has factory methods for common categories: `Error.Validation(...)`, `Error.NotFound(...)`, `Error.Conflict(...)`, `Error.Unexpected(...)`.

Controllers use `Match` to convert results to HTTP responses.

Domain invariant violations (true programmer errors) remain as exceptions.

## Consequences

**Positive:**

- Return types communicate failure possibility. A handler returning `Result<T>` forces the caller to handle both paths.
- No try-catch blocks in handlers for business logic errors.
- `Map`, `Ensure`, and `Match` enable composable flows without nesting.
- Error categorization (`Validation`, `NotFound`, etc.) maps cleanly to HTTP status codes.

**Negative:**

- The domain layer throws exceptions for invariant violations, creating an inconsistent boundary. Handlers must pre-check domain conditions or wrap domain calls to avoid unhandled exceptions escaping as 500s. This is the most significant cost — see audit finding F3.
- `Result<T>` lacks `Bind` (flatMap) for chaining operations that themselves return `Result<T>`. This limits composability for multi-step operations.
- Single-error design. `ValidationCommandHandler` returns only the first validation failure. Extending to multiple errors requires a collection type.

## Alternatives Considered

**Exceptions only.** All errors thrown as typed exceptions, caught by middleware. Rejected because exceptions for expected outcomes (user enters invalid data, room not found) are semantically wrong and expensive.

**FluentResults library.** Provides a mature `Result<T>` with multi-error support. Rejected to avoid external dependency for a core primitive. The current implementation is 60 lines and covers the needed surface area. Can be extended internally.

**OneOf discriminated unions.** `OneOf<Success, ValidationError, NotFoundError>`. Rejected because it optimizes for exhaustive matching at the cost of a NuGet dependency and less readable handler signatures.
