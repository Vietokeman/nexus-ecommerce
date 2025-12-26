export interface Order {
    id: string;
    username: string;
    totalPrice: number;
    firstName: string;
    lastName: string;
    emailAddress: string;
    addressLine: string;
    country: string;
    state: string;
    zipCode: string;
    createdDate?: Date;
    lastModifiedDate?: Date;
}
