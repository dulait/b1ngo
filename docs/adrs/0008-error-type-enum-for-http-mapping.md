---
title: Add ErrorType Enum for Deterministic HTTP Status Mapping
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

# 0008. Add ErrorType Enum for Deterministic HTTP Status Mapping

**Status:** proposed
**Date:** 2026-03-14
**Deciders:** Software Architect

## Context

`ApiController.ToActionResult` maps application errors to HTTP status codes by pattern-matching on `Error.Code` strings:

```csharp
_ when error.Code.StartsWith("Validation") => BadRequest(...)
_ when error.Code.EndsWith("NotFound") => NotFound(...)
_ when error.Code.StartsWith("Conflict") => Conflict(...)
```

This works only if error codes follow an undocumented naming convention. A code like `"InvalidSession"` would silently fall through to 500.

## Decision

Add an `ErrorType` enum to the `Error` record. Map HTTP status codes from `ErrorType`, not from string parsing.

```csharp
public enum ErrorType { Validation, NotFound, Conflict, Unexpected }

public sealed record Error(ErrorType Type, string Code, string Message)
{
    public static Error Validation(string code, string message)
        => new(ErrorType.Validation, $"Validation.{code}", message);

    public static Error NotFound(string entity, object id)
        => new(ErrorType.NotFound, $"{entity}.NotFound", $"{entity} with ID '{id}' was not found.");

    public static Error Conflict(string code, string message)
        => new(ErrorType.Conflict, $"Conflict.{code}", message);

    public static Error Unexpected(string message)
        => new(ErrorType.Unexpected, "Unexpected", message);
}
```

Controller mapping becomes:

```csharp
private IActionResult ToActionResult(Error error)
    => error.Type switch
    {
        ErrorType.Validation => BadRequest(new { error.Code, error.Message }),
        ErrorType.NotFound   => NotFound(new { error.Code, error.Message }),
        ErrorType.Conflict   => Conflict(new { error.Code, error.Message }),
        _                    => StatusCode(500, new { error.Code, error.Message })
    };
```

The `Code` string is retained for client-facing error identification. The `Type` drives infrastructure behavior (HTTP mapping). Separate concerns.

## Consequences

**Positive:**

- HTTP mapping is deterministic. Every error category maps to exactly one status code, enforced by the enum.
- Compile-time exhaustiveness checking on the switch expression.
- New error categories (e.g., `Forbidden`, `TooManyRequests`) are added as enum values with corresponding factory methods and switch arms.

**Negative:**

- Breaking change to `Error`'s constructor signature. All call sites need updating. At current scale: 4 factory methods + 2 handler call sites.

## Alternatives Considered

**Convention-enforced code strings.** Document the naming convention and trust developers to follow it. Rejected because undocumented conventions degrade over time, and the fix (an enum) is trivial.

**Exception-based error types.** Throw typed exceptions (`NotFoundException`, `ValidationException`) and catch in middleware. Rejected because it contradicts ADR-0003 (Result-based error handling).
