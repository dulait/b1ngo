using B1ngo.Domain.Core;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace B1ngo.Infrastructure.Tests;

public class DomainEventDispatcherTests
{
    private readonly ServiceCollection _services = new();
    private readonly TestLogger _logger = new();

    private DomainEventDispatcher CreateSut()
    {
        var provider = _services.BuildServiceProvider();
        return new DomainEventDispatcher(provider, _logger);
    }

    [Fact]
    public async Task DispatchAsync_HandlerSucceedsOnFirstAttempt_NoRetryNoDelay()
    {
        var handler = new CountingHandler();
        _services.AddScoped<IDomainEventHandler<TestEvent>>(_ => handler);
        var sut = CreateSut();

        await sut.DispatchAsync([new TestEvent()]);

        Assert.Equal(1, handler.CallCount);
        Assert.Empty(_logger.Warnings);
        Assert.Empty(_logger.Errors);
    }

    [Fact]
    public async Task DispatchAsync_HandlerFailsThenSucceeds_EventDeliveredViaRetry()
    {
        var handler = new FailNTimesHandler(1);
        _services.AddScoped<IDomainEventHandler<TestEvent>>(_ => handler);
        var sut = CreateSut();

        await sut.DispatchAsync([new TestEvent()]);

        Assert.Equal(2, handler.CallCount);
        Assert.True(handler.Succeeded);
        Assert.Single(_logger.Warnings);
        Assert.Empty(_logger.Errors);
    }

    [Fact]
    public async Task DispatchAsync_AllRetriesFail_LogsErrorAndContinues()
    {
        var failingHandler = new FailNTimesHandler(10);
        var successHandler = new CountingHandler();
        _services.AddScoped<IDomainEventHandler<TestEvent>>(_ => failingHandler);
        _services.AddScoped<IDomainEventHandler<TestEvent>>(_ => successHandler);
        var sut = CreateSut();

        await sut.DispatchAsync([new TestEvent()]);

        Assert.Equal(4, failingHandler.CallCount);
        Assert.False(failingHandler.Succeeded);
        Assert.Single(_logger.Errors);
        Assert.Equal(1, successHandler.CallCount);
    }

    [Fact]
    public async Task DispatchAsync_MultipleHandlers_FailureInOneDoesNotPreventOthers()
    {
        var failingHandler = new FailNTimesHandler(10);
        var successHandler = new CountingHandler();
        _services.AddScoped<IDomainEventHandler<TestEvent>>(_ => failingHandler);
        _services.AddScoped<IDomainEventHandler<TestEvent>>(_ => successHandler);
        var sut = CreateSut();

        await sut.DispatchAsync([new TestEvent()]);

        Assert.Equal(1, successHandler.CallCount);
        Assert.True(successHandler.Succeeded);
    }

    private sealed record TestEvent : IDomainEvent
    {
        public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
        public Guid? CorrelationId { get; set; }
    }

    private sealed class CountingHandler : IDomainEventHandler<TestEvent>
    {
        public int CallCount { get; private set; }
        public bool Succeeded { get; private set; }

        public Task HandleAsync(TestEvent domainEvent, CancellationToken cancellationToken = default)
        {
            CallCount++;
            Succeeded = true;
            return Task.CompletedTask;
        }
    }

    private sealed class FailNTimesHandler(int failCount) : IDomainEventHandler<TestEvent>
    {
        public int CallCount { get; private set; }
        public bool Succeeded { get; private set; }

        public Task HandleAsync(TestEvent domainEvent, CancellationToken cancellationToken = default)
        {
            CallCount++;

            if (CallCount <= failCount)
            {
                throw new InvalidOperationException($"Simulated failure #{CallCount}");
            }

            Succeeded = true;
            return Task.CompletedTask;
        }
    }

    private sealed class TestLogger : ILogger<DomainEventDispatcher>
    {
        public List<string> Warnings { get; } = [];
        public List<string> Errors { get; } = [];

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter
        )
        {
            var message = formatter(state, exception);

            if (logLevel == LogLevel.Warning)
            {
                Warnings.Add(message);
            }
            else if (logLevel == LogLevel.Error)
            {
                Errors.Add(message);
            }
        }

        public bool IsEnabled(LogLevel logLevel) => true;

        public IDisposable? BeginScope<TState>(TState state)
            where TState : notnull => null;
    }
}
