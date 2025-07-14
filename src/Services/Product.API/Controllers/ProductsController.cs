using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Product.API.Entities;
using Product.API.Repositories.Interfaces;
using Shared.DTOs;
using System.ComponentModel.DataAnnotations;

namespace Product.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProducRepository _productRepo;
        private readonly IMapper _mapper;
        public ProductsController(IProducRepository productRepo, IMapper mapper)
        {
            _productRepo = productRepo;
            _mapper = mapper;
        }


        #region CRUD
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _productRepo.GetProducts();
            if (products == null || !products.Any())
            {
                return NotFound("No products found.");
            }
            var productDtos = _mapper.Map<IEnumerable<ProductDto>>(products);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct([FromRoute] long id)
        {
            var products = await _productRepo.GetProduct(id);
            if (products == null)
            {
                return NotFound("No products found.");
            }
            var productDtos = _mapper.Map<ProductDto>(products);
            return Ok(products);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto productDto)
        {
            var product = _mapper.Map<CatalogProduct>(productDto);
            await _productRepo.CreateProduct(product);
            await _productRepo.SaveChangesAsync();
            var result = _mapper.Map<ProductDto>(product);
            return Ok(result);
        }

        [HttpPut(template: "{id:long}")]
        public async Task<IActionResult> UpdateProduct([Required] long id, [FromBody] UpdateProductDto productDto)
        {
            var product = await _productRepo.GetProduct(id);
            if (product == null)
            {
                return NotFound();
            }
            var updateProduct = _mapper.Map(productDto, product);
            await _productRepo.UpdateProduct(updateProduct);
            await _productRepo.SaveChangesAsync();
            var result = _mapper.Map<ProductDto>(product);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct([FromRoute] long id)
        {
            var product = await _productRepo.GetProduct(id);
            if (product == null)
            {
                return NotFound();
            }
            await _productRepo.DeleteProduct(id);
            await _productRepo.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("search/{productNo}")]
        public async Task<IActionResult> GetProductByNo([FromRoute] string productNo)
        {
            var products = await _productRepo.GetProducByNo(productNo);
            if (products == null || !products.Any())
            {
                return NotFound("No products found with the specified product number.");
            }
            var productDtos = _mapper.Map<IEnumerable<ProductDto>>(products);
            return Ok(productDtos);
        }
        #endregion
    }
}
