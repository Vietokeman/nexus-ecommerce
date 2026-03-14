using Microsoft.SemanticKernel;

namespace Nexus.AI.Service.Filters;

public sealed class KernelLoggingFilter(ILogger<KernelLoggingFilter> logger) : IFunctionInvocationFilter
{
    public async Task OnFunctionInvocationAsync(FunctionInvocationContext context, Func<FunctionInvocationContext, Task> next)
    {
        logger.LogInformation("Invoking kernel function {Plugin}.{Function}", context.Function.PluginName, context.Function.Name);
        await next(context);
    }
}
