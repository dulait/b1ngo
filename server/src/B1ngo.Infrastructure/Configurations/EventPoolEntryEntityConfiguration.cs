using B1ngo.Infrastructure.ReferenceData;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace B1ngo.Infrastructure.Configurations;

internal sealed class EventPoolEntryEntityConfiguration : IEntityTypeConfiguration<EventPoolEntryEntity>
{
    public void Configure(EntityTypeBuilder<EventPoolEntryEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EventKey).HasColumnType("varchar(100)");
        builder.Property(x => x.DisplayText).HasColumnType("varchar(200)");

        builder.HasOne(x => x.SessionType).WithMany().HasForeignKey(x => x.SessionTypeId);
        builder.HasIndex(x => new { x.SessionTypeId, x.EventKey }).IsUnique();
    }
}
