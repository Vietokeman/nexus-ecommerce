using AutoMapper;
using Ordering.Application.Common.Mappings;
using Ordering.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ordering.Application.Common.Models
{
    public class OrderDto : IMapFrom<Domain.Entities.Order>
    {
        public long Id { get; set; }
        public string UserName { get; set; }
        public decimal TotalPrice { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAdress { get; set; }
        public string ShipppingAdress { get; set; }
        public string InvoiceAdress { get; set; }

        public EOrderStatus Status { get; set; }
    }
}