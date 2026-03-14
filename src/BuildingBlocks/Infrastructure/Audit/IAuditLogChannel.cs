using System.Threading.Channels;

namespace Infrastructure.Audit;

public interface IAuditLogChannel
{
    ValueTask WriteAsync(AuditLogEntry entry, CancellationToken cancellationToken);
    ChannelReader<AuditLogEntry> Reader { get; }
}

public class AuditLogChannel : IAuditLogChannel
{
    private readonly Channel<AuditLogEntry> _channel;

    public AuditLogChannel(AuditLoggingOptions options)
    {
        var boundedOptions = new BoundedChannelOptions(options.ChannelCapacity)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        };

        _channel = Channel.CreateBounded<AuditLogEntry>(boundedOptions);
    }

    public ChannelReader<AuditLogEntry> Reader => _channel.Reader;

    public ValueTask WriteAsync(AuditLogEntry entry, CancellationToken cancellationToken)
        => _channel.Writer.WriteAsync(entry, cancellationToken);
}
