using B1ngo.Infrastructure.ReferenceData;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace B1ngo.Infrastructure.Configurations;

internal sealed class EventPoolEntryEntityConfiguration : IEntityTypeConfiguration<EventPoolEntryEntity>
{
    public void Configure(EntityTypeBuilder<EventPoolEntryEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.SessionType).HasColumnType("varchar(50)");
        builder.Property(x => x.EventKey).HasColumnType("varchar(100)");
        builder.Property(x => x.DisplayText).HasColumnType("varchar(200)");

        builder.HasIndex(x => new { x.SessionType, x.EventKey }).IsUnique();
    }
}
