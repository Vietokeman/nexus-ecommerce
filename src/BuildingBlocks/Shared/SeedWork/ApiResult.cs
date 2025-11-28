namespace Shared.SeedWork;

public class ApiResult<T>
{
    public bool IsSucceeded { get; set; }
    public string? Message { get; set; }
    public T? Result { get; set; }

    public ApiResult()
    {
    }

    public ApiResult(bool isSucceeded, string? message = null)
    {
        IsSucceeded = isSucceeded;
        Message = message ?? (isSucceeded ? "Operation completed successfully" : "Operation failed");
    }

    public ApiResult(bool isSucceeded, T? result, string? message = null)
    {
        IsSucceeded = isSucceeded;
        Result = result;
        Message = message ?? (isSucceeded ? "Operation completed successfully" : "Operation failed");
    }
}
