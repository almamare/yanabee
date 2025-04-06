export interface Shipment {
  id: string;
  order_no: string;
  tracking_no: number;
  note: string;
  amount: string; 
  status: string;
  shipment_type: string;
  order_type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  delivered_date: string;
  label: string;
}

export interface ShipmentsResponse {
  total: number;
  pages: number;
  items: Shipment[];
}