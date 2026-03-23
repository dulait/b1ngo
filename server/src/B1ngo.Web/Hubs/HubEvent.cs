namespace B1ngo.Web.Hubs;

public abstract record HubEvent
{
    public Guid? CorrelationId { get; init; }

    public HubEvent WithCorrelationId(Guid? correlationId) => this with { CorrelationId = correlationId };
}
