using Microsoft.AspNetCore.Mvc;

namespace Seller.API.Controllers
{
    [ApiController]
    public class HomeController : ControllerBase
    {
        [HttpGet("/")]
        public IActionResult Index()
        {
            return Redirect("~/swagger");
        }
    }
}
