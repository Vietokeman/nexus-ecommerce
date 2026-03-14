using Admin.API.Models;
using Admin.API.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/post")]
public sealed class PostController(AdminDataStore store) : ControllerBase
{
    [HttpPost]
    public IActionResult CreatePost([FromBody] CreateUpdatePostRequest request)
    {
        var created = store.Locked(() =>
        {
            if (store.Posts.Any(x => x.Slug.Equals(request.Slug, StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            var category = store.PostCategories.FirstOrDefault(x => x.Id == request.CategoryId);
            if (category is null)
            {
                return false;
            }

            store.Posts.Add(new PostModel
            {
                Title = request.Title.Trim(),
                Slug = request.Slug.Trim(),
                Summary = request.Summary,
                Content = request.Content,
                CategoryId = category.Id,
                CategoryName = category.Name,
                Tags = request.Tags,
                ActivityLogs =
                [
                    new PostActivityLogModel
                    {
                        Action = "Created",
                        PerformedBy = "admin"
                    }
                ]
            });

            return true;
        });

        return created ? Ok() : BadRequest("Invalid payload or duplicated slug.");
    }

    [HttpPut]
    public IActionResult UpdatePost(Guid id, [FromBody] CreateUpdatePostRequest request)
    {
        var updated = store.Locked(() =>
        {
            var post = store.Posts.FirstOrDefault(x => x.Id == id);
            if (post is null)
            {
                return false;
            }

            if (store.Posts.Any(x => x.Id != id && x.Slug.Equals(request.Slug, StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            var category = store.PostCategories.FirstOrDefault(x => x.Id == request.CategoryId);
            if (category is null)
            {
                return false;
            }

            post.Title = request.Title.Trim();
            post.Slug = request.Slug.Trim();
            post.Summary = request.Summary;
            post.Content = request.Content;
            post.CategoryId = category.Id;
            post.CategoryName = category.Name;
            post.Tags = request.Tags;
            post.DateModified = DateTime.UtcNow;
            post.ActivityLogs.Add(new PostActivityLogModel
            {
                Action = "Updated",
                PerformedBy = "admin"
            });
            return true;
        });

        return updated ? Ok() : BadRequest("Invalid payload or post not found.");
    }

    [HttpDelete]
    public IActionResult DeletePosts([FromQuery] Guid[] ids)
    {
        store.Locked(() =>
        {
            store.Posts.RemoveAll(post => ids.Contains(post.Id));
            foreach (var series in store.Series)
            {
                series.Posts.RemoveAll(post => ids.Contains(post.PostId));
            }
        });

        return Ok();
    }

    [HttpGet("{id:guid}")]
    public ActionResult<PostModel> GetPostById(Guid id)
    {
        var post = store.Locked(() => store.Posts.FirstOrDefault(x => x.Id == id));
        return post is null ? NotFound() : Ok(post);
    }

    [HttpGet("paging")]
    public ActionResult<PageResult<PostModel>> GetPostsPaging(string? keyword, Guid? categoryId, int pageIndex = 1, int pageSize = 10)
    {
        var (items, total) = store.Locked(() =>
        {
            var query = store.Posts.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x =>
                    x.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                    || x.Slug.Contains(keyword, StringComparison.OrdinalIgnoreCase));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == categoryId.Value);
            }

            var totalRows = query.Count();
            var pageItems = query
                .OrderByDescending(x => x.DateModified)
                .Skip((Math.Max(pageIndex, 1) - 1) * Math.Max(pageSize, 1))
                .Take(Math.Max(pageSize, 1))
                .ToList();

            return (pageItems, totalRows);
        });

        return Ok(new PageResult<PostModel>
        {
            Results = items,
            CurrentPage = Math.Max(pageIndex, 1),
            PageSize = Math.Max(pageSize, 1),
            RowCount = total
        });
    }

    [HttpGet("series-belong/{postId:guid}")]
    public ActionResult<List<SeriesModel>> GetSeriesBelong(Guid postId)
    {
        var series = store.Locked(() =>
            store.Series
                .Where(x => x.Posts.Any(p => p.PostId == postId))
                .OrderBy(x => x.Name)
                .ToList());

        return Ok(series);
    }

    [HttpGet("approve/{id:guid}")]
    public IActionResult ApprovePost(Guid id)
    {
        var updated = UpdateStatus(id, "Approved", "Approved");
        return updated ? Ok() : NotFound();
    }

    [HttpGet("approval-submit/{id:guid}")]
    public IActionResult SendToApprove(Guid id)
    {
        var updated = UpdateStatus(id, "PendingApproval", "Submitted for approval");
        return updated ? Ok() : NotFound();
    }

    [HttpPost("return-back/{id:guid}")]
    public IActionResult ReturnBack(Guid id, [FromBody] ReturnBackRequest model)
    {
        var updated = store.Locked(() =>
        {
            var post = store.Posts.FirstOrDefault(x => x.Id == id);
            if (post is null)
            {
                return false;
            }

            post.Status = "Returned";
            post.ReturnReason = model.Reason;
            post.DateModified = DateTime.UtcNow;
            post.ActivityLogs.Add(new PostActivityLogModel
            {
                Action = "Returned",
                PerformedBy = "admin",
                Note = model.Reason
            });
            return true;
        });

        return updated ? Ok() : NotFound();
    }

    [HttpGet("return-reason/{id:guid}")]
    public ActionResult<string?> GetReason(Guid id)
    {
        var reason = store.Locked(() => store.Posts.FirstOrDefault(x => x.Id == id)?.ReturnReason);
        return Ok(reason);
    }

    [HttpGet("activity-logs/{id:guid}")]
    public ActionResult<List<PostActivityLogModel>> GetActivityLogs(Guid id)
    {
        var logs = store.Locked(() => store.Posts.FirstOrDefault(x => x.Id == id)?.ActivityLogs ?? []);
        return Ok(logs);
    }

    [HttpGet("tags")]
    public ActionResult<List<string>> GetAllTags()
    {
        var tags = store.Locked(() =>
            store.Posts
                .SelectMany(x => x.Tags)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(x => x)
                .ToList());

        return Ok(tags);
    }

    [HttpGet("tags/{postId:guid}")]
    public ActionResult<List<string>> GetTagsByPost(Guid postId)
    {
        var tags = store.Locked(() => store.Posts.FirstOrDefault(x => x.Id == postId)?.Tags ?? []);
        return Ok(tags);
    }

    private bool UpdateStatus(Guid id, string status, string action)
    {
        return store.Locked(() =>
        {
            var post = store.Posts.FirstOrDefault(x => x.Id == id);
            if (post is null)
            {
                return false;
            }

            post.Status = status;
            post.DateModified = DateTime.UtcNow;
            post.ActivityLogs.Add(new PostActivityLogModel
            {
                Action = action,
                PerformedBy = "admin"
            });
            return true;
        });
    }
}
