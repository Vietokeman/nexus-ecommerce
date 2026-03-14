using Microsoft.SemanticKernel;

namespace Nexus.AI.Service.Filters;

public sealed class KernelAutoInvocationFilter(ILogger<KernelAutoInvocationFilter> logger) : IAutoFunctionInvocationFilter
{
    public async Task OnAutoFunctionInvocationAsync(AutoFunctionInvocationContext context, Func<AutoFunctionInvocationContext, Task> next)
    {
        logger.LogInformation(
            "Auto tool invocation {Index}/{Count}: {Plugin}.{Function}",
            context.FunctionSequenceIndex + 1,
            context.FunctionCount,
            context.Function.PluginName,
            context.Function.Name);

        await next(context);
    }
}
