---
title: CQRS Without MediatR
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

# 0002. CQRS Without MediatR

**Status:** accepted
**Date:** 2026-03-14
**Deciders:** Software Architect

## Context

The application layer separates commands (state changes) from queries (reads). This is standard CQRS. The question is how to dispatch commands to handlers.

MediatR is the dominant library for this in .NET. It provides a mediator, a pipeline behavior system, and convention-based handler discovery. It also brings an indirect coupling between senders and handlers, additional NuGet dependencies, and implicit behavior via the pipeline.

## Decision

Implement CQRS with explicit interfaces and manual DI wiring. No MediatR.

The primitives:

```csharp
public interface ICommand<TResponse>;
public interface ICommandHandler<in TCommand, TResponse>
    where TCommand : ICommand<TResponse>
{
    Task<Result<TResponse>> HandleAsync(TCommand command, CancellationToken ct);
}
```

Cross-cutting behaviors (validation) are implemented as decorators wrapping the inner handler. DI registration is explicit via a helper method:

```csharp
services.AddCommandHandler<CreateRoomCommand, CreateRoomResponse, CreateRoomHandler>();
```

This registers the concrete handler and wraps it with `ValidationCommandHandler<,>`.

## Consequences

**Positive:**

- Zero magic. Every handler registration is visible in `DependencyInjection.cs`. No assembly scanning, no convention-based discovery.
- The decorator pattern for cross-cutting concerns is simpler than MediatR's `IPipelineBehavior<,>` — it's a plain class wrapping another class.
- One fewer NuGet dependency. No coupling to MediatR's release cycle or API changes.
- Controllers inject `ICommandHandler<TCommand, TResponse>` directly — type-safe, refactor-safe.

**Negative:**

- Each new command requires a line in `DependencyInjection.cs`. MediatR auto-discovers handlers. At the current scale (2 commands), this is trivial. At 50 commands, it would warrant a convention-based registration helper (scanning the assembly for `ICommandHandler<,>` implementations).
- Adding a new cross-cutting behavior (e.g., logging, authorization) requires modifying the DI helper to add another decorator layer. MediatR's pipeline behaviors are more plug-and-play for this.
- No built-in `INotificationHandler<>` equivalent for domain event handler registration. The current `DomainEventDispatcher` uses reflection to resolve handlers.

## Alternatives Considered

**MediatR.** Provides pipeline behaviors, notification handlers, and auto-discovery. Rejected because the indirection it introduces (send a command, something somewhere handles it) trades explicitness for convenience. In a small codebase focused on craftsmanship, the explicitness of direct DI wiring is more valuable than the convenience of auto-discovery.

**Wolverine.** More opinionated than MediatR, includes message transport and saga support. Rejected as overbuilt for a single-context application with no async messaging requirements.
