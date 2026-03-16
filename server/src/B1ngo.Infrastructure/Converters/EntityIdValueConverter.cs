using B1ngo.Domain.Core;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace B1ngo.Infrastructure.Converters;

public sealed class EntityIdValueConverter<TId>()
    : ValueConverter<TId, Guid>(id => id.Value, guid => EntityId<TId>.From(guid))
        where TId : EntityId<TId>;
