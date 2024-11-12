import { useEffect, useState } from "react"
import { fetchQuotes, getQouteTableColums } from "../utils/fetcher"
import { message, Pagination, Spin, Table, Tag } from 'antd';
import moment from "moment";
import { currencyFormat, getStatusColor, presentError } from "../utils/helpers"
import QuoteForm from "./quoteForm";

function QuoteListing() {

  moment.locale('de')

  const [dataSource, setDataSource] = useState<{total: string , key:string, created:string, customerInfo:string,description:string,status:any }[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [currentPageSize, setCurrentPageSize] = useState<number>(10)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [messageApi, messageContextHolder] = message.useMessage()
  const [sortedInfo, setSortedInfo] = useState<{columnKey:string|undefined,order:string|undefined}>({columnKey:undefined,order:undefined})
  const [filteredInfo, setFilteredInfo] = useState<{[index: string] : string[]}>({})
  const [quoteIdToEdit, setQuoteIdToEdit] = useState<string|null>(null)

  const requestQuotes = async () => {

    setIsLoading(true)
    try{
      let quoteList = await fetchQuotes({ page:currentPage,perPage:currentPageSize, sorting: sortedInfo, filtering:filteredInfo })
      let newDataSource:{total: string , key:string, created:string, customerInfo:string,description:string,status:any }[] = []
      setTotalItems(quoteList.totalItems)
      if(quoteList?.items && quoteList?.items.length > 0){
        quoteList.items.forEach((item,index)=> {
          newDataSource.push({
            key:item.id,
            created:moment(item.created).format('DD.MM.YYYY HH:MM:SS'),
            customerInfo:item.customer_info.name + ' from ' + item.customer_info.country ,
            description:item.description,
            status:<Tag color={getStatusColor(item.status)} key={'tag_'+index}>{item.status.toUpperCase()}</Tag>,
            total:currencyFormat(item.total),
          })
        })
      }
      setDataSource(newDataSource)
    }
    catch(error:any){
      presentError(error.message,messageApi)
    }
    finally{
      setIsLoading(false)
    }

  }

  useEffect(() => {
    requestQuotes()
  }, [currentPage,currentPageSize,sortedInfo]);


  const handleChange = (pagination: any, filters: any, sorter: any) => {
    if(sortedInfo.columnKey !== sorter.columnKey || sortedInfo.order !== sorter.order){
      setCurrentPage(1) // on sortchange jump to page 1
    }
    setFilteredInfo(filters)
    setSortedInfo(sorter)
  };

  return <Spin spinning={isLoading}>
    {messageContextHolder}
    <QuoteForm quoteId={quoteIdToEdit} resetModalBySettingQuoteIdToNull={setQuoteIdToEdit} triggerReloadOfQoutes={requestQuotes} />
    <Table 
      virtual 
      scroll={{ y : 770}}
      dataSource={dataSource} 
      columns={getQouteTableColums()} 
      pagination={false}
      onChange={handleChange}
      onRow={(record) => {
        return {
          onClick: () => { setQuoteIdToEdit(record.key) }, 
        };
      }}
    />
    <Pagination current={currentPage} className="pt-5 pb-5" align="center" pageSize={currentPageSize} showSizeChanger={true} total={totalItems} onChange={(page, pageSize) => {
        setCurrentPage(page)
        setCurrentPageSize(pageSize)
      }} />
    </Spin>
    
}

export default QuoteListing;