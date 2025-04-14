
// This file is part of the Shipments module
export interface Shipments {
    id: string;
    order_no: string;
    tracking_no: string;
    note: string;
    amount: string;
    status: string;
    shipment_type: string;
    order_type: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    delivered_date: string;
}

// This interface represents the response structure for the shipments query
export interface ShipmentsResponse {
    total: number;
    pages: number;
    items: Shipments[];
}