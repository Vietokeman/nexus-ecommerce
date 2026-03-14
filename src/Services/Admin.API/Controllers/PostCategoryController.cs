using Admin.API.Models;
using Admin.API.Services;
using Admin.API.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/post-category")]
public sealed class PostCategoryController(AdminDataStore store, INotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public ActionResult<List<PostCategoryModel>> GetPostCategories()
    {
        return Ok(store.Locked(() => store.PostCategories.OrderBy(x => x.Name).ToList()));
    }

    [HttpGet("paging")]
    public ActionResult<PageResult<PostCategoryModel>> GetPostCategoriesPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
    {
        var (items, total) = store.Locked(() =>
        {
            var query = store.PostCategories.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x =>
                    x.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                    || x.Slug.Contains(keyword, StringComparison.OrdinalIgnoreCase));
            }

            var totalRows = query.Count();
            var pageItems = query
                .Skip((Math.Max(pageIndex, 1) - 1) * Math.Max(pageSize, 1))
                .Take(Math.Max(pageSize, 1))
                .ToList();

            return (pageItems, totalRows);
        });

        return Ok(new PageResult<PostCategoryModel>
        {
            Results = items,
            CurrentPage = Math.Max(pageIndex, 1),
            PageSize = Math.Max(pageSize, 1),
            RowCount = total
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePostCategory(Guid id, [FromBody] CreateUpdatePostCategoryRequest request, CancellationToken cancellationToken)
    {
        var updated = store.Locked(() =>
        {
            var category = store.PostCategories.FirstOrDefault(x => x.Id == id);
            if (category is null)
            {
                return false;
            }

            category.Name = request.Name.Trim();
            category.Slug = request.Slug.Trim();
            category.Description = request.Description;
            return true;
        });

        if (!updated)
        {
            return NotFound();
        }

        await notificationService.PublishAsync(new CreateNotificationRequest
        {
            Title = "Category updated",
            Message = $"Category '{request.Name}' was updated.",
            Link = "/admin/dashboard",
            Type = "Category"
        }, cancellationToken);

        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> CreatePostCategory([FromBody] CreateUpdatePostCategoryRequest request, CancellationToken cancellationToken)
    {
        store.Locked(() =>
        {
            store.PostCategories.Add(new PostCategoryModel
            {
                Name = request.Name.Trim(),
                Slug = request.Slug.Trim(),
                Description = request.Description
            });
        });

        await notificationService.PublishAsync(new CreateNotificationRequest
        {
            Title = "Category created",
            Message = $"Category '{request.Name}' was created.",
            Link = "/admin/dashboard",
            Type = "Category"
        }, cancellationToken);

        return Ok();
    }

    [HttpDelete("{ids}")]
    public async Task<IActionResult> DeletePostCategories([FromRoute] Guid[] ids, CancellationToken cancellationToken)
    {
        var removed = 0;
        store.Locked(() =>
        {
            removed = store.PostCategories.RemoveAll(x => ids.Contains(x.Id));
            store.Posts.RemoveAll(post => !store.PostCategories.Any(category => category.Id == post.CategoryId));
        });

        if (removed > 0)
        {
            await notificationService.PublishAsync(new CreateNotificationRequest
            {
                Title = "Categories deleted",
                Message = $"{removed} category(s) were removed.",
                Link = "/admin/dashboard",
                Type = "Category"
            }, cancellationToken);
        }

        return Ok();
    }
}
