using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game;

public class Player : Entity<PlayerId>
{
    public string DisplayName { get; private set; } = null!;
    public BingoCard? Card { get; private set; }
    public bool HasWon { get; private set; }

    private Player() { }

    private Player(PlayerId id, string displayName)
        : base(id)
    {
        DisplayName = displayName;
    }

    public static Player Create(string displayName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        return new Player(PlayerId.New(), displayName);
    }

    public void AssignCard(BingoCard card)
    {
        ArgumentNullException.ThrowIfNull(card);

        if (Card is not null)
        {
            throw new DomainConflictException("card_already_assigned", "Player already has a card assigned.");
        }

        Card = card;
    }

    internal void SetWon()
    {
        HasWon = true;
    }

    internal void RevokeWin()
    {
        HasWon = false;
    }
}

public sealed record PlayerId(Guid Value) : EntityId<PlayerId>(Value);
