using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/media")]
public sealed class MediaController(IWebHostEnvironment hostEnvironment) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> UploadImage([FromQuery] string type = "common")
    {
        var files = Request.Form.Files;
        if (files.Count == 0)
        {
            return BadRequest("No file uploaded.");
        }

        var file = files[0];
        var extension = Path.GetExtension(file.FileName);
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        if (!allowed.Contains(extension, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest("Only image files are allowed.");
        }

        var safeType = string.IsNullOrWhiteSpace(type) ? "common" : type.Trim().ToLowerInvariant();
        var monthFolder = DateTime.UtcNow.ToString("MMyyyy");
        var imageFolder = Path.Combine(hostEnvironment.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot"), "images", safeType, monthFolder);

        Directory.CreateDirectory(imageFolder);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(imageFolder, fileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/images/{safeType}/{monthFolder}/{fileName}";
        return Ok(new { path = relativePath });
    }
}
