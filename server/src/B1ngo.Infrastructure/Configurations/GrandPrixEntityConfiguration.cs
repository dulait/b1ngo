using B1ngo.Infrastructure.ReferenceData;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace B1ngo.Infrastructure.Configurations;

internal sealed class GrandPrixEntityConfiguration : IEntityTypeConfiguration<GrandPrixEntity>
{
    public void Configure(EntityTypeBuilder<GrandPrixEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasColumnType("varchar(100)");
        builder.Property(x => x.SessionTypes).HasColumnType("jsonb");
        builder.HasIndex(x => new { x.Name, x.Season }).IsUnique();
    }
}
