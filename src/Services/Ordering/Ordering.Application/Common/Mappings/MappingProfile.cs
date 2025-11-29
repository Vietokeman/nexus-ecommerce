using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Ordering.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            ApplyMappingsFromAssempbly(Assembly.GetExecutingAssembly());
        }

        private void ApplyMappingsFromAssempbly(Assembly assembly)
        {
            var mapFromType = typeof(IMapFrom<>);
            const string mappingMethodName = nameof(IMapFrom<object>.Mapping);
            bool Hasinterface(Type t) => t.IsGenericType && t.GetGenericTypeDefinition() == mapFromType;

            var types = assembly.GetExportedTypes()
                .Where(t => t.GetInterfaces().Any(Hasinterface))
                .ToList();

            foreach (var type in types)
            {
                var instance = Activator.CreateInstance(type);
                
                // Check if there's a custom Mapping method
                var methods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance)
                    .Where(m => m.Name == mappingMethodName
                        && m.GetParameters().Length == 1
                        && m.GetParameters()[0].ParameterType == typeof(Profile))
                    .ToList();

                if (methods.Any())
                {
                    // Use custom mapping
                    foreach (var method in methods)
                    {
                        method.Invoke(instance, new object[] { this });
                    }
                }
                else
                {
                    // Auto create mapping from source type to destination type
                    var interfaceType = type.GetInterfaces()
                        .First(i => i.IsGenericType && i.GetGenericTypeDefinition() == mapFromType);
                    var sourceType = interfaceType.GetGenericArguments()[0];
                    
                    CreateMap(sourceType, type)
                        .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
                }
            }
        }
    }
}
