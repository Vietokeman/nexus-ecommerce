using Admin.API.Hubs;
using Admin.API.Models;
using Admin.API.Stores;
using Microsoft.AspNetCore.SignalR;

namespace Admin.API.Services;

public interface INotificationService
{
    Task<NotificationModel> PublishAsync(CreateNotificationRequest request, CancellationToken cancellationToken = default);
    PageResult<NotificationModel> GetPaged(bool? isRead, int pageIndex, int pageSize);
    int GetUnreadCount();
    bool MarkAsRead(Guid notificationId);
    int MarkAllAsRead();
}

public sealed class NotificationService(AdminDataStore store, IHubContext<NotificationHub> hubContext) : INotificationService
{
    private const int MaxStoredNotifications = 1000;

    public async Task<NotificationModel> PublishAsync(CreateNotificationRequest request, CancellationToken cancellationToken = default)
    {
        var model = new NotificationModel
        {
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Link = request.Link,
            Type = request.Type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        store.Locked(() =>
        {
            store.Notifications.Insert(0, model);
            if (store.Notifications.Count > MaxStoredNotifications)
            {
                store.Notifications.RemoveRange(MaxStoredNotifications, store.Notifications.Count - MaxStoredNotifications);
            }
        });

        await hubContext.Clients.All.SendAsync("ReceiveNotification", new
        {
            id = model.Id,
            title = model.Title,
            message = model.Message,
            link = model.Link,
            type = model.Type,
            isRead = model.IsRead,
            createdAt = model.CreatedAt
        }, cancellationToken);

        return model;
    }

    public PageResult<NotificationModel> GetPaged(bool? isRead, int pageIndex, int pageSize)
    {
        var safePage = Math.Max(pageIndex, 1);
        var safeSize = Math.Clamp(pageSize, 1, 100);

        return store.Locked(() =>
        {
            IEnumerable<NotificationModel> query = store.Notifications;

            if (isRead.HasValue)
            {
                query = query.Where(notification => notification.IsRead == isRead.Value);
            }

            var totalRows = query.Count();
            var pageItems = query
                .OrderByDescending(notification => notification.CreatedAt)
                .Skip((safePage - 1) * safeSize)
                .Take(safeSize)
                .ToList();

            return new PageResult<NotificationModel>
            {
                Results = pageItems,
                CurrentPage = safePage,
                PageSize = safeSize,
                RowCount = totalRows
            };
        });
    }

    public int GetUnreadCount()
    {
        return store.Locked(() => store.Notifications.Count(notification => !notification.IsRead));
    }

    public bool MarkAsRead(Guid notificationId)
    {
        return store.Locked(() =>
        {
            var notification = store.Notifications.FirstOrDefault(item => item.Id == notificationId);
            if (notification is null)
            {
                return false;
            }

            notification.IsRead = true;
            return true;
        });
    }

    public int MarkAllAsRead()
    {
        return store.Locked(() =>
        {
            var updated = 0;
            foreach (var notification in store.Notifications.Where(item => !item.IsRead))
            {
                notification.IsRead = true;
                updated++;
            }

            return updated;
        });
    }
}
