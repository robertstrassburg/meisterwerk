import { CollectionName } from "./collectionName"
import { ApiResponse } from "./apiResponse"

export interface Product {
    attributes: null
    collectionId: string
    collectionName: CollectionName
    created: string
    description: string
    id: string
    in_stock: boolean
    price: number
    title: string
    updated: string
}

export interface ProductsResponse extends ApiResponse {
    items: Product[]
}