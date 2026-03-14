using Admin.API.Models;
using Admin.API.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/series")]
public sealed class SeriesController(AdminDataStore store) : ControllerBase
{
    [HttpPost]
    public IActionResult CreateSeries([FromBody] CreateUpdateSeriesRequest request)
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

        return Ok();
    }

    [HttpPut]
    public IActionResult UpdateSeries(Guid id, [FromBody] CreateUpdateSeriesRequest request)
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

        return updated ? Ok() : NotFound();
    }

    [Route("post-series")]
    [HttpPut]
    public IActionResult AddPostSeries([FromBody] AddPostSeriesRequest request)
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

        return updated ? Ok() : BadRequest();
    }

    [Route("post-series")]
    [HttpDelete]
    public IActionResult DeletePostSeries([FromBody] AddPostSeriesRequest request)
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

        return updated ? Ok() : NotFound();
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
    public IActionResult DeleteSeries([FromQuery] Guid[] ids)
    {
        store.Locked(() => store.Series.RemoveAll(x => ids.Contains(x.Id)));
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
