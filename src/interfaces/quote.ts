import { CollectionName } from "./collectionName"
import { ApiResponse } from "./apiResponse"

export interface QuoteItem {
    price: number,
    product_name: string,
    quantity: number,
    subtotal: number
}

export enum QuoteStatus {
    DRAFT = "DRAFT",
    EXPIRED = "EXPIRED",
    SENT = "SENT",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}

export const QuoteStatusFilterData: QuoteStatus[] = [
    QuoteStatus.DRAFT,
    QuoteStatus.EXPIRED,
    QuoteStatus.SENT,
    QuoteStatus.ACCEPTED,
    QuoteStatus.REJECTED
];

export interface Quote {
    collectionId: string,
    collectionName: CollectionName,
    created: string,
    customer_info: CustomerInfo,
    description: string,
    id: string,
    items: QuoteItem[]
    status: QuoteStatus,
    subtotal: number,
    total: number,
    total_tax: number,
    updated: string,
    valid_until: string
}

export interface CustomerInfo {
        address: string,
        city: string,
        country: string,
        email: string,
        name: string,
        phone: string
}

export interface QuotesResponse extends ApiResponse {
    items: Quote[]
}