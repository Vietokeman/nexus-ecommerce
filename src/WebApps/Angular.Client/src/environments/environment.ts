export const environment = {
    production: false,
    application: {
        name: 'Distributed Ecommerce',
        logoUrl: '',
    },
    oAuthConfig: {
        issuer: 'http://localhost:5000',
        clientId: 'Angular_App',
        dummyClientSecret: '1q2w3e*',
        scope: 'offline_access EcommerceAPI',
        showDebugInformation: true,
        oidc: false,
        requireHttps: false,
    },
    apis: {
        default: {
            url: 'http://localhost:5000',
            rootNamespace: 'Ecommerce',
        },
        product: {
            url: 'http://localhost:5000/api/products',
        },
        customer: {
            url: 'http://localhost:5000/api/customers',
        },
        basket: {
            url: 'http://localhost:5000/api/baskets',
        },
        ordering: {
            url: 'http://localhost:5000/api/orders',
        },
    },
};
