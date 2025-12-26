export interface Customer {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    createdDate?: Date;
    lastModifiedDate?: Date;
}

export interface CreateCustomerDto {
    username: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
}
