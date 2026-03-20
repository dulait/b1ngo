using B1ngo.Infrastructure.ReferenceData;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace B1ngo.Infrastructure.Configurations;

internal sealed class SessionTypeEntityConfiguration : IEntityTypeConfiguration<SessionTypeEntity>
{
    public void Configure(EntityTypeBuilder<SessionTypeEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasColumnType("varchar(50)");
        builder.Property(x => x.DisplayName).HasColumnType("varchar(100)");
        builder.HasIndex(x => x.Name).IsUnique();
    }
}
