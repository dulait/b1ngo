using B1ngo.Domain.Core;

namespace B1ngo.Domain.Game;

public sealed class BingoSquare
{
    public int Row { get; private set; }
    public int Column { get; private set; }
    public string DisplayText { get; private set; }
    public string? EventKey { get; private set; }
    public bool IsFreeSpace { get; private set; }
    public bool IsMarked { get; private set; }
    public SquareMarkedBy? MarkedBy { get; private set; }
    public DateTimeOffset? MarkedAt { get; private set; }

    private BingoSquare() => DisplayText = null!;

    private BingoSquare(int row, int column, string displayText, string? eventKey, bool isFreeSpace)
    {
        Row = row;
        Column = column;
        DisplayText = displayText;
        EventKey = eventKey;
        IsFreeSpace = isFreeSpace;

        if (isFreeSpace)
        {
            IsMarked = true;
        }
    }

    public static BingoSquare CreatePredefined(int row, int column, string displayText, string eventKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayText);
        ArgumentException.ThrowIfNullOrWhiteSpace(eventKey);
        return new BingoSquare(row, column, displayText, eventKey, isFreeSpace: false);
    }

    public static BingoSquare CreateFreeSpace(int row, int column) =>
        new(row, column, "FREE", eventKey: null, isFreeSpace: true);

    internal void Mark(SquareMarkedBy markedBy, DateTimeOffset markedAt)
    {
        if (IsFreeSpace)
        {
            throw new DomainConflictException(
                "square_is_free_space",
                "Cannot mark a free space — it is always marked."
            );
        }

        if (IsMarked)
        {
            throw new DomainConflictException("square_already_marked", "Square is already marked.");
        }

        if (markedBy == SquareMarkedBy.Api && EventKey is null)
        {
            throw new DomainConflictException("square_is_custom", "Custom squares cannot be auto-marked.");
        }

        IsMarked = true;
        MarkedBy = markedBy;
        MarkedAt = markedAt;
    }

    internal void Unmark()
    {
        if (IsFreeSpace)
        {
            throw new DomainConflictException("square_is_free_space", "Cannot unmark a free space.");
        }

        if (!IsMarked)
        {
            throw new DomainConflictException("square_not_marked", "Square is not marked.");
        }

        IsMarked = false;
        MarkedBy = null;
        MarkedAt = null;
    }

    internal void Edit(string newDisplayText)
    {
        if (IsFreeSpace)
        {
            throw new DomainConflictException("square_is_free_space", "Cannot edit a free space.");
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(newDisplayText);

        DisplayText = newDisplayText;
        EventKey = null;
    }
}
