using AutoMapper;
using EventBus.Messages.Events;
using Ordering.Application.Features.V1.Orders.Commands.CreateOrder;

namespace Ordering.API.Mappings
{
    /// <summary>
    /// AutoMapper profile for mapping integration events to commands
    /// </summary>
    public class EventBusMappingProfile : Profile
    {
        public EventBusMappingProfile()
        {
            // Map BasketCheckoutEvent to CreateOrderCommand
            // Note: Handle naming differences between event and command
            CreateMap<BasketCheckoutEvent, CreateOrderCommand>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.TotalPrice))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                .ForMember(dest => dest.EmailAdress, opt => opt.MapFrom(src => src.EmailAddress)) // Note: typo in domain
                .ForMember(dest => dest.ShipppingAdress, opt => opt.MapFrom(src => src.ShippingAddress)) // Note: typo in domain
                .ForMember(dest => dest.InvoiceAdress, opt => opt.MapFrom(src => src.InvoiceAddress)); // Note: typo in domain
        }
    }
}
