using B1ngo.Application.Common.Ports;
using Microsoft.Extensions.Logging;

namespace B1ngo.Infrastructure.Email;

internal sealed class LogEmailSender(ILogger<LogEmailSender> logger) : IEmailSender
{
    public Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        logger.LogInformation("Email to {To} | Subject: {Subject}\n{Body}", to, subject, htmlBody);

        return Task.CompletedTask;
    }
}
