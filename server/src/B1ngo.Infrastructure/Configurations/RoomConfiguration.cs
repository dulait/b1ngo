using B1ngo.Domain.Game;
using B1ngo.Infrastructure.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace B1ngo.Infrastructure.Configurations;

internal sealed class RoomEntityConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.JoinCode).HasMaxLength(15);

        builder.HasIndex(x => x.JoinCode).IsUnique();

        builder.Property(x => x.Status).HasConversion<string>();

        builder.Property(x => x.HostPlayerId);

        builder.OwnsOne(
            x => x.Session,
            session =>
            {
                session.WithOwner().HasForeignKey("Id");
                session.Property(s => s.Season);
                session.Property(s => s.GrandPrixName).HasMaxLength(100);
                session.Property(s => s.SessionType).HasConversion<string>();
            }
        );

        builder.OwnsOne(
            x => x.Configuration,
            config =>
            {
                config.ToJson();
                config.Property(c => c.MatrixSize);
            }
        );

        builder.HasMany(x => x.Players).WithOne().OnDelete(DeleteBehavior.Cascade);

        builder.OwnsMany(
            x => x.Leaderboard,
            lb =>
            {
                lb.ToJson();
                lb.Property(e => e.PlayerId).HasConversion(new EntityIdValueConverter<PlayerId>());
                lb.Property(e => e.WinningPattern).HasConversion<string>();
            }
        );
    }
}
