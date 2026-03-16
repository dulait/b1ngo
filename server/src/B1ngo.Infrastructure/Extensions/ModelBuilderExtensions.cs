using B1ngo.Domain.Core;
using B1ngo.Infrastructure.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace B1ngo.Infrastructure.Extensions;

public static class ModelBuilderExtensions
{
    public static void ApplyGlobalConventions(this ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!entityType.IsOwned())
            {
                entityType.SetTableName(entityType.ClrType.Name.Pluralize().ToSnakeCase());
            }

            var isMappedToJson = entityType.IsMappedToJson();

            foreach (var property in entityType.GetProperties())
            {
                if (!isMappedToJson)
                {
                    property.SetColumnName(property.Name.ToSnakeCase());
                }
            }

            if (!isMappedToJson)
            {
                foreach (var key in entityType.GetForeignKeys())
                {
                    foreach (var property in key.Properties)
                    {
                        property.SetColumnName(property.Name.ToSnakeCase());
                    }
                }
            }

            foreach (var property in entityType.GetProperties())
            {
                var propertyType = property.ClrType;

                if (!typeof(IEntityId).IsAssignableFrom(propertyType))
                {
                    continue;
                }

                var converterType = typeof(EntityIdValueConverter<>).MakeGenericType(propertyType);
                var converter = Activator.CreateInstance(converterType);
                property.SetValueConverter((ValueConverter)converter!);
            }
        }
    }
}
