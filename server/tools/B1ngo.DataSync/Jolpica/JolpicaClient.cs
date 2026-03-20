using System.Net.Http.Json;
using B1ngo.DataSync.Jolpica.Models;

namespace B1ngo.DataSync.Jolpica;

internal sealed class JolpicaClient(HttpClient httpClient)
{
    public async Task<IReadOnlyList<JolpicaRace>> FetchSeasonAsync(int year)
    {
        var response = await httpClient.GetFromJsonAsync<JolpicaResponse>($"{year}.json");

        return response?.MRData?.RaceTable?.Races is null or { Count: 0 } ? [] : response.MRData.RaceTable.Races;
    }
}
