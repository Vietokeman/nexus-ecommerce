using Admin.API.Models;
using Admin.API.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/post-category")]
public sealed class PostCategoryController(AdminDataStore store) : ControllerBase
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
    public IActionResult UpdatePostCategory(Guid id, [FromBody] CreateUpdatePostCategoryRequest request)
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

        return updated ? Ok() : NotFound();
    }

    [HttpPost]
    public IActionResult CreatePostCategory([FromBody] CreateUpdatePostCategoryRequest request)
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

        return Ok();
    }

    [HttpDelete("{ids}")]
    public IActionResult DeletePostCategories([FromRoute] Guid[] ids)
    {
        store.Locked(() =>
        {
            store.PostCategories.RemoveAll(x => ids.Contains(x.Id));
            store.Posts.RemoveAll(post => !store.PostCategories.Any(category => category.Id == post.CategoryId));
        });

        return Ok();
    }
}
