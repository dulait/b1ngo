using B1ngo.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace B1ngo.Infrastructure.Configurations;

internal sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_messages");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");

        builder.Property(x => x.EventType).HasColumnName("event_type").HasMaxLength(500).IsRequired();

        builder.Property(x => x.Payload).HasColumnName("payload").HasColumnType("jsonb").IsRequired();

        builder.Property(x => x.OccurredAt).HasColumnName("occurred_at").IsRequired();

        builder.Property(x => x.ProcessedAt).HasColumnName("processed_at");

        builder.Property(x => x.RetryCount).HasColumnName("retry_count").HasDefaultValue(0);

        builder.Property(x => x.Error).HasColumnName("error").HasMaxLength(2000);

        builder
            .HasIndex(x => x.ProcessedAt)
            .HasDatabaseName("ix_outbox_messages_processed_at")
            .HasFilter("processed_at IS NULL");
    }
}
