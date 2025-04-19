
/**
 * @description Settings type
 * This should match the input type defined in your GraphQL schema.
 */
export interface Ratings {
    id: string;
    user: string;
    role: string;
    rating: number;
    feedback: string;
    created_at: string;
}

/**
 * @description RatingsResponse type
 */
export interface Advertisement {
    id: number;
    title: string;
    img: string;
    role: string;
    created_at: string;
    updated_at: string;
}

/**
 * @description RatingsResponse type
 */
export interface AdvertisementsResponse {
    advertisements: {
        total: number;
        pages: number;
        items: Advertisement[];
    };
}

// Interface for a payment method
export interface PaymentMethod {
    id: string;
    method_name: string;
    description: string;
}

// Interface for an order type
export interface OrderType {
    id: string;
    type_name: string;
    description: string;
}

// Interface for settings
export interface Setting {
    id: string;
    role: string;
    title: string;
    support_phone: string;
    support_email: string;
    description: string;
    privacy_policy: string;
    terms_of_use: string;
    content: string;
    about: string;
}

// Interface for a state
export interface State {
    state_code: string;
    state_name: string;
}

// Main interface for the entire query response
export interface PaymentMethodsQueryResponse {
    cities: any;
    paymentMethods: PaymentMethod[];
    orderTypes: OrderType[];
    settings: Setting[];
    states: State[];
}

// Interface for a city
export interface Tutorial {
    id: string;
    title: string;
    content: string;
    url: string;
    role: string;
    created_at: string;
    updated_at: string;
}

// Interface for a district
export interface TutorialsResponse {
    tutorials: {
        total: number;
        pages: number;
        items: Tutorial[];
    };
}
