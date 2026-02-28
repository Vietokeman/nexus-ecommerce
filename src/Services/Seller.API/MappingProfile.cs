using AutoMapper;
using Seller.API.Entities;
using Shared.DTOs.Seller;

namespace Seller.API
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SellerProduct, SellerProductDto>();
            CreateMap<CreateSellerProductDto, SellerProduct>()
                .ForMember(d => d.Description, opt => opt.MapFrom(s => s.BasicDescription));
            CreateMap<UpdateSellerProductDto, SellerProduct>().IgnoreAllNonExisting();
            CreateMap<ProductReview, ProductReviewDto>();
        }
    }
}
