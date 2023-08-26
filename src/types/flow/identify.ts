
export interface IdentifyRequest{
    email? : string;
    phoneNumber? : string;
}

export interface IdentifyResponse{
    contact: ContactDetails;
}

export interface ContactDetails{
    primaryContactId: number;
    emails: Array<string>;
    phoneNumbers: Array<string>;
    secondaryContactIds: Array<number>;
}