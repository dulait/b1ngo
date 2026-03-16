using B1ngo.Infrastructure.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace B1ngo.Infrastructure.Configurations;

internal sealed class PlayerTokenConfiguration : IEntityTypeConfiguration<PlayerToken>
{
    public void Configure(EntityTypeBuilder<PlayerToken> builder)
    {
        builder.ToTable("player_tokens");

        builder.HasKey(x => x.Token);
        builder.Property(x => x.Token).HasColumnName("token");

        builder.Property(x => x.PlayerId)
            .HasColumnName("player_id")
            .IsRequired();

        builder.Property(x => x.RoomId)
            .HasColumnName("room_id")
            .IsRequired();

        builder.Property(x => x.IsHost)
            .HasColumnName("is_host")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.HasIndex(x => x.PlayerId)
            .HasDatabaseName("ix_player_tokens_player_id");
    }
}
