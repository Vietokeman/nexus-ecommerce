using RabbitMQ.Client;
using RabbitMQ.Client.Events;

var connectionFactory = new ConnectionFactory()
{
    HostName = "localhost",
    //Port = 5672,
    //UserName = "guest",
    //Password
};
var connection = connectionFactory.CreateConnectionAsync();
using var channel = connection.Result.CreateChannelAsync();
await channel.Result.QueueDeclareAsync(
    queue: "order",
    exclusive: false
    );

var consumer = new AsyncEventingBasicConsumer(channel.Result);
consumer.ReceivedAsync += async (model, ea) =>
{
    var body = ea.Body.ToArray();
    var message = System.Text.Encoding.UTF8.GetString(body);
    Console.WriteLine(" [x] Received {0}", message);
    await Task.Yield();
};


await channel.Result.BasicConsumeAsync(
    queue: "order",
    autoAck: true,
    consumer: consumer
    );
Console.ReadKey();