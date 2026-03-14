using Admin.API.Models;
using Admin.API.Services;
using Admin.API.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/series")]
public sealed class SeriesController(AdminDataStore store, INotificationService notificationService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateSeries([FromBody] CreateUpdateSeriesRequest request, CancellationToken cancellationToken)
    {
        store.Locked(() =>
        {
            store.Series.Add(new SeriesModel
            {
                Name = request.Name.Trim(),
                Slug = request.Slug.Trim(),
                Description = request.Description
            });
        });

        await notificationService.PublishAsync(new CreateNotificationRequest
        {
            Title = "Series created",
            Message = $"Series '{request.Name}' was created.",
            Link = "/admin/dashboard",
            Type = "Series"
        }, cancellationToken);

        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSeries(Guid id, [FromBody] CreateUpdateSeriesRequest request, CancellationToken cancellationToken)
    {
        var updated = store.Locked(() =>
        {
            var series = store.Series.FirstOrDefault(x => x.Id == id);
            if (series is null)
            {
                return false;
            }

            series.Name = request.Name.Trim();
            series.Slug = request.Slug.Trim();
            series.Description = request.Description;
            return true;
        });

        if (!updated)
        {
            return NotFound();
        }

        await notificationService.PublishAsync(new CreateNotificationRequest
        {
            Title = "Series updated",
            Message = $"Series '{request.Name}' was updated.",
            Link = "/admin/dashboard",
            Type = "Series"
        }, cancellationToken);

        return Ok();
    }

    [Route("post-series")]
    [HttpPut]
    public async Task<IActionResult> AddPostSeries([FromBody] AddPostSeriesRequest request, CancellationToken cancellationToken)
    {
        var updated = store.Locked(() =>
        {
            var series = store.Series.FirstOrDefault(x => x.Id == request.SeriesId);
            if (series is null)
            {
                return false;
            }

            if (!store.Posts.Any(x => x.Id == request.PostId))
            {
                return false;
            }

            if (series.Posts.Any(x => x.PostId == request.PostId))
            {
                return false;
            }

            series.Posts.Add(new SeriesPostModel
            {
                PostId = request.PostId,
                SortOrder = request.SortOrder
            });
            return true;
        });

        if (!updated)
        {
            return BadRequest();
        }

        await notificationService.PublishAsync(new CreateNotificationRequest
        {
            Title = "Post linked to series",
            Message = $"Post {request.PostId} was added to series {request.SeriesId}.",
            Link = "/admin/dashboard",
            Type = "Series"
        }, cancellationToken);

        return Ok();
    }

    [Route("post-series")]
    [HttpDelete]
    public async Task<IActionResult> DeletePostSeries([FromBody] AddPostSeriesRequest request, CancellationToken cancellationToken)
    {
        var updated = store.Locked(() =>
        {
            var series = store.Series.FirstOrDefault(x => x.Id == request.SeriesId);
            if (series is null)
            {
                return false;
            }

            return series.Posts.RemoveAll(x => x.PostId == request.PostId) > 0;
        });

        if (!updated)
        {
            return NotFound();
        }

        await notificationService.PublishAsync(new CreateNotificationRequest
        {
            Title = "Post unlinked from series",
            Message = $"Post {request.PostId} was removed from series {request.SeriesId}.",
            Link = "/admin/dashboard",
            Type = "Series"
        }, cancellationToken);

        return Ok();
    }

    [Route("post-series/{seriesId:guid}")]
    [HttpGet]
    public ActionResult<List<PostModel>> GetPostsInSeries(Guid seriesId)
    {
        var posts = store.Locked(() =>
        {
            var series = store.Series.FirstOrDefault(x => x.Id == seriesId);
            if (series is null)
            {
                return null;
            }

            var postMap = store.Posts.ToDictionary(x => x.Id);
            return series.Posts
                .OrderBy(x => x.SortOrder)
                .Where(x => postMap.ContainsKey(x.PostId))
                .Select(x => postMap[x.PostId])
                .ToList();
        });

        return posts is null ? NotFound() : Ok(posts);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteSeries([FromQuery] Guid[] ids, CancellationToken cancellationToken)
    {
        var deleted = 0;
        store.Locked(() => deleted = store.Series.RemoveAll(x => ids.Contains(x.Id)));

        if (deleted > 0)
        {
            await notificationService.PublishAsync(new CreateNotificationRequest
            {
                Title = "Series deleted",
                Message = $"{deleted} series item(s) were deleted.",
                Link = "/admin/dashboard",
                Type = "Series"
            }, cancellationToken);
        }

        return Ok();
    }

    [HttpGet("{id:guid}")]
    public ActionResult<SeriesModel> GetSeriesById(Guid id)
    {
        var series = store.Locked(() => store.Series.FirstOrDefault(x => x.Id == id));
        return series is null ? NotFound() : Ok(series);
    }

    [HttpGet("paging")]
    public ActionResult<PageResult<SeriesModel>> GetSeriesPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
    {
        var (items, total) = store.Locked(() =>
        {
            var query = store.Series.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x =>
                    x.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                    || x.Slug.Contains(keyword, StringComparison.OrdinalIgnoreCase));
            }

            var totalRows = query.Count();
            var pageItems = query
                .OrderByDescending(x => x.DateCreated)
                .Skip((Math.Max(pageIndex, 1) - 1) * Math.Max(pageSize, 1))
                .Take(Math.Max(pageSize, 1))
                .ToList();

            return (pageItems, totalRows);
        });

        return Ok(new PageResult<SeriesModel>
        {
            Results = items,
            CurrentPage = Math.Max(pageIndex, 1),
            PageSize = Math.Max(pageSize, 1),
            RowCount = total
        });
    }

    [HttpGet]
    public ActionResult<List<SeriesModel>> GetAllSeries()
    {
        return Ok(store.Locked(() => store.Series.OrderBy(x => x.Name).ToList()));
    }
}
