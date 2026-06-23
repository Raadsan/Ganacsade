import { axiosInstance } from "./client"

export interface CustomerOrder {
  id: string
  order_number: string
  order_type?: string | null
  subtotal: number | string
  tax: number | string
  shipping: number | string
  discount: number | string
  total: number | string
  status: string
  payment_status?: string | null
  tracking_number?: string | null
  created_at: string
  updated_at?: string
  item_count?: number
}

export interface CustomerOrderItem {
  id: string
  product_name: string
  product_image_url?: string | null
  quantity: number
  unit_price: number | string
  total: number | string
}

export interface CustomerOrderDetail extends CustomerOrder {
  items?: CustomerOrderItem[]
  statusHistory?: Array<{
    id: string
    status: string
    notes?: string | null
    created_at: string
  }>
}

export interface CreateOrderItem {
  productId: string
  productName: string
  productImage?: string | null
  unitPrice: number
  quantity: number
  total: number
  discountAmount?: number
  variantId?: string | null
}

export interface CreateOrderPayload {
  items: CreateOrderItem[]
  shippingAddress: {
    phone: string
    fullName?: string
    address?: string
    city?: string
  }
  paymentMethod: {
    method: string
    label?: string
  }
  subtotal: number
  tax?: number
  shipping?: number
  discount?: number
  total: number
  notes?: string
}

export const customerOrdersApi = {
  getMyOrders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get("/customer/orders", { params })
    return response.data
  },

  getMyOrder: async (id: string) => {
    const response = await axiosInstance.get(`/customer/orders/${id}`)
    return response.data
  },

  createOrder: async (payload: CreateOrderPayload) => {
    const response = await axiosInstance.post("/customer/orders", payload)
    return response.data
  },
}
