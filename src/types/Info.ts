export type Info = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    target: string;
    scope: string;
    address: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    x?: string;
    termsOfService?: string; // URL or path to the terms of service PDF
    privacyPolicy?: string; // URL or path to the privacy policy PDF
}

export interface InfoApi {
    _id: string;
    name: string;
    email: string;
    phone: string;
    target: string;
    scope: string;
    address: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    x?: string;
    termsOfService?: string; // URL or path to the terms of service PDF
    privacyPolicy?: string; // URL or path to the privacy policy PDF
}