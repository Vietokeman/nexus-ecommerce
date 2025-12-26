export const environment = {
    production: true,
    application: {
        name: 'Distributed Ecommerce',
        logoUrl: '',
    },
    oAuthConfig: {
        issuer: 'https://your-production-domain.com',
        clientId: 'Angular_App',
        dummyClientSecret: '1q2w3e*',
        scope: 'offline_access EcommerceAPI',
        showDebugInformation: false,
        oidc: false,
        requireHttps: true,
    },
    apis: {
        default: {
            url: 'https://api.your-production-domain.com',
            rootNamespace: 'Ecommerce',
        },
        product: {
            url: 'https://api.your-production-domain.com/api/products',
        },
        customer: {
            url: 'https://api.your-production-domain.com/api/customers',
        },
        basket: {
            url: 'https://api.your-production-domain.com/api/baskets',
        },
        ordering: {
            url: 'https://api.your-production-domain.com/api/orders',
        },
    },
};
