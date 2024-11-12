import { TableColumnsType } from "antd";
import { Quote, QuotesResponse, QuoteStatusFilterData } from "../interfaces/quote";
import { ProductsResponse } from "../interfaces/product";

export interface PaginationParams {
    page: number
    perPage: number
    sorting : {
        columnKey: string | undefined
        order: string | undefined
    }
    filtering : { [index: string] : string[] }
}

export const fetchQuotes = async (pagination:PaginationParams): Promise<QuotesResponse> => {

    const headers = {
      'Content-Type': 'application/json',
    };

    let requestPage = pagination.page?pagination.page : 1
    let requestPerPage = pagination.perPage?pagination.perPage : 10

    let sorting = ''
    if(pagination.sorting.columnKey !== undefined && pagination.sorting.order !== undefined){
        sorting = '&sort='+((pagination.sorting.order === 'ascend')?'':'-')+pagination.sorting.columnKey
    }

    let filtering = ''
    if(pagination.filtering){

        let filterItems:string[] = [] // and binded
        for (const [key, value] of Object.entries(pagination.filtering)) {
            let filterSubItems:string[] = [] // or binded
            let subfield = ''

            if(key === 'customer_info'){ subfield = '.country' } // because we only filter by country on customer_info column
            value?.forEach((item)=>{ filterSubItems.push(key+subfield+"~'"+item+"'") })

            if(filterSubItems.length>0){
                filterItems.push('(' + filterSubItems.join(' || ') + ')') // (status='EXPIRED' || status='SENT')
            }
        }
        if(filterItems.length > 0){
            filtering = '&filter=('+filterItems.join(' %26%26 ')+')'
        }
    }

    try{
        const response = await fetch('http://127.0.0.1:8090/api/collections/quotes/records/?page='+requestPage+'&perPage='+requestPerPage+sorting+filtering, {
            headers,
        });
        if(response.status === 200){
            let quotesResponse = await response.json()
            return quotesResponse    
        }
        else{
            throw new Error("Unexpected Status");
        }
    }
    catch(error:any){
        throw new Error(error);
    }
    
  };

  export const fetchQuote = async (quoteId:string): Promise<Quote> => {

    const headers = {
      'Content-Type': 'application/json',
    };

    try{
        const response = await fetch('http://127.0.0.1:8090/api/collections/quotes/records/'+quoteId, {
            headers,
        });
        if(response.status === 200){
            let quotesResponse = await response.json()
            return quotesResponse    
        }
        else{
            throw new Error("Unexpected Status");
        }
    }
    catch(error:any){
        throw new Error(error);
    }
    
  };

  export const fetch100Products = async (): Promise<ProductsResponse> => {

    let url = 'http://127.0.0.1:8090/api/collections/products/records?perPage=100'
    const cache = await caches.open('products')
    const cachedProducts = await cache.match(url)
    const cacheTimestamp = cachedProducts ? cachedProducts.headers.get('X-Cache-Timestamp') : null

    let needCacheUpdate = true
    if(cacheTimestamp){
      const currentTime = Date.now()
      const cacheAge = currentTime - parseInt(cacheTimestamp)
      if (cacheAge < 10000){ // 10 seconds for test reasons
        needCacheUpdate = false
      }
    }

    if (cachedProducts && !needCacheUpdate) {// load response from cache if available
      return await cachedProducts.json() as ProductsResponse;
    }
    else{
      const headers = {
        'Content-Type': 'application/json',
      }
      
      try{
          const response = await fetch(url, {
              headers,
          })
          
          if(response.status === 200){

            if (response.ok) {
              const clonedResponse = response.clone()
              const newHeaders = new Headers(clonedResponse.headers);
              newHeaders.set('X-Cache-Timestamp', Date.now().toString());

              const cacheResponse = new Response(clonedResponse.body, {
                status: clonedResponse.status,
                statusText: clonedResponse.statusText,
                headers: newHeaders,
              });

              cache.put(url, cacheResponse)
            }

              let productsResponse = await response.json()
              return productsResponse
          }
          else{
              throw new Error("Unexpected Status")
          }
      }
      catch(error:any){
          throw new Error(error)
      }
    }
  }

  export const patchquote = async (quote:Quote): Promise<boolean> => {

    const headers = {
      'Content-Type': 'application/json',
    };

    try{
        const response = await fetch('http://127.0.0.1:8090/api/collections/quotes/records/'+quote.id, {
            method: 'PATCH',
            body: JSON.stringify(quote)
          ,headers
          
        });
        if(response.ok){
            let productsResponse = await response.json()
            return productsResponse
        }
        else{
          let productsResponse = await response.json()
          throw new Error(response.status + ' ' + productsResponse.message)
        }
    }
    catch(error:any){
        throw new Error(error);
    }
    
  };

  export const createquote = async (quote:Quote): Promise<boolean> => {

    const headers = {
      'Content-Type': 'application/json',
    };

    try{
        const response = await fetch('http://127.0.0.1:8090/api/collections/quotes/records/', {
            method: 'POST',
            body: JSON.stringify(quote)
          ,headers
          
        });
        if(response.ok){
            let productsResponse = await response.json()
            return productsResponse
        }
        else{
            let productsResponse = await response.json()
            throw new Error(response.status + ' ' + productsResponse.message);
        }
    }
    catch(error:any){
        throw new Error(error);
    } 

  }

export const getQouteTableColums = (): TableColumnsType<any> => {

    let Countries = ['Cyprus','Kuwait','Samoa','Tonga','Italy'] // should get defined fully or loaded by an api endpoint

    return [
        {
          title: 'Created',
          dataIndex: 'created',
          key: 'created',
          sorter: (a: { created: string  }, b: { created: string  }) => {return 0}, // sorting comes from api
          fixed: "left",
          width: 100,
        },
        {
          title: 'CustomerInfo',
          dataIndex: 'customerInfo',
          key: 'customer_info',
          filters:Countries.map((country,index)=>{return {text:country,value:country}}),
          fixed: "left",
          width: 150,
        },
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
          width: 200,
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          sorter: (a: { status: string  }, b: { status: string  }) => {return 0}, // sorting comes from api,
          filters: QuoteStatusFilterData.map((quoteType, index)=>{ return { text:quoteType,value:quoteType}}),
          fixed:'right',
          width:100
        },
        {
          title: 'Total',
          dataIndex: 'total',
          key: 'total',
          sorter: (a: { total: string  }, b: { total: string  }) => {return 0}, // sorting comes from api
          fixed:'right',
          width:100
        }
      ]
    
}

export const getProducts = async (setProductsData:Function) => {

  // should be paginated with search like here: https://codesandbox.io/p/sandbox/5s3378?file=%2Findex.html
  // for time reasons just 100 products get loaded
  let prodResponse = await fetch100Products()

  const tempProductData:any[] = [];

  prodResponse.items.forEach((item:any)=>{
    const data = {
      key: item.id,
      title: item.title,
      description: item.description,
      price: item.price
    };
    tempProductData.push(data);
  })

  setProductsData(tempProductData);
}