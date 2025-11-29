using FluentValidation;

namespace Ordering.Application.Features.V1.Orders.Commands.CreateOrder
{
    public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("{UserName} is required.")
                .NotNull()
                .MaximumLength(50).WithMessage("{UserName} must not exceed 50 characters.");

            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("{FirstName} is required.")
                .NotNull()
                .MaximumLength(50).WithMessage("{FirstName} must not exceed 50 characters.");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("{LastName} is required.")
                .NotNull()
                .MaximumLength(250).WithMessage("{LastName} must not exceed 250 characters.");

            RuleFor(x => x.EmailAdress)
                .NotEmpty().WithMessage("{EmailAdress} is required.")
                .EmailAddress().WithMessage("{EmailAdress} must be a valid email address.");

            RuleFor(x => x.TotalPrice)
                .GreaterThan(0).WithMessage("{TotalPrice} must be greater than 0.");
        }
    }
}
