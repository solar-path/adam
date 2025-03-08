export type ContactType = 'home' | 'work' | 'mobile';
export type AddressType = 'home' | 'delivery' | 'billing';

export interface Contact {
    id: string;
    telephone: string;
    email: string;
    primary: boolean;
    url: string;
    type: ContactType;
}

export interface Address {
    id: string;
    addressLine: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    type: AddressType;
    primary: boolean;
}

export const defaultContact: Contact[] = [{
    id: '',
    telephone: '',
    email: '',
    primary: true,
    url: '',
    type: 'home',
}];

export const defaultAddress: Address[] = [{
    id: '',
    addressLine: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    type: 'home',
    primary: true,
}];