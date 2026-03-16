using B1ngo.Domain.Game;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace B1ngo.Infrastructure.Configurations;

internal sealed class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.DisplayName).HasMaxLength(50);

        builder.Property(x => x.HasWon);

        builder.OwnsOne(
            x => x.Card,
            card =>
            {
                card.ToJson();
                card.OwnsMany(c => c.Squares);
            }
        );
    }
}
