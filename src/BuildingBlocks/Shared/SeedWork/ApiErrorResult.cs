namespace Shared.SeedWork;

public class ApiErrorResult<T> : ApiResult<T>
{
    public List<string> Errors { get; set; }

    public ApiErrorResult() : this(message: "Something wrong happened. Please try again later")
    {
    }

    public ApiErrorResult(string message) : base(isSucceeded: false, message)
    {
        Errors = new List<string>();
    }

    public ApiErrorResult(List<string> errors) : base(isSucceeded: false, "Error")
    {
        Errors = errors;
    }

    public ApiErrorResult(string message, List<string> errors) : base(isSucceeded: false, message)
    {
        Errors = errors;
    }
}
