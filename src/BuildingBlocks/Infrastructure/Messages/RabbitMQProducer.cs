using Contracts.Common.Interfaces;
using Contracts.Messages;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Messages
{
    public class RabbitMQProducer : IMessageProducer
    {
        private readonly ISerializeService _serializeService;
        public RabbitMQProducer(ISerializeService serializeService)
        {
            _serializeService = serializeService;
        }

        public void SendMessage<T>(T message)
        {
            var connectionFactory = new ConnectionFactory()
            {
                HostName = "localhost",
                //Port = 5672,
                //UserName = "guest",
                //Password
            };
            using var connection = connectionFactory.CreateConnection();
            using var channel = connection.CreateModel();

            channel.QueueDeclare(
                queue: "order",
                durable: false,
                exclusive: false,
                autoDelete: false,
                arguments: null
                );
            var json = _serializeService.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);
            channel.BasicPublish(
                exchange: "",
                routingKey: "order",
                basicProperties: null,
                body: body
                );
        }
    }
}
