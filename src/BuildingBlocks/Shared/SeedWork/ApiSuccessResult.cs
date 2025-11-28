namespace Shared.SeedWork;

public class ApiSuccessResult<T> : ApiResult<T>
{
    public ApiSuccessResult() : base(isSucceeded: true)
    {
    }

    public ApiSuccessResult(T result) : base(isSucceeded: true, result)
    {
    }

    public ApiSuccessResult(T result, string message) : base(isSucceeded: true, result, message)
    {
    }
}
