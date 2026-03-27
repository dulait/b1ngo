using B1ngo.Application.Common.Ports;
using Microsoft.Extensions.Configuration;
using Resend;

namespace B1ngo.Infrastructure.Email;

internal sealed class ResendEmailSender(IResend resend, IConfiguration config) : IEmailSender
{
    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        var message = new EmailMessage
        {
            From = config["Email:FromAddress"]!,
            To = { to },
            Subject = subject,
            HtmlBody = htmlBody,
        };

        await resend.EmailSendAsync(message, ct);
    }
}
