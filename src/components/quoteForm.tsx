import { useEffect, useState } from "react";
import { CustomerInfo, Quote, QuoteItem, QuoteStatusFilterData } from "../interfaces/quote"
import { Button, Form, Input, InputNumber, message, Modal, Select, Spin, Transfer, TransferProps } from "antd";
import { createquote, fetch100Products, fetchQuote, patchquote } from "../utils/fetcher";
import { presentError } from "../utils/helpers";

const { TextArea } = Input;

interface RecordType {
  key: string;
  title: string;
  description: string;
  chosen: boolean;
}

function QuoteForm(props:{quoteId:string|null,resetModalBySettingQuoteIdToNull:Function,triggerReloadOfQoutes:Function}) {

  const [form] = Form.useForm()
  const [openModal, setOpenModal] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [messageApi, messageContextHolder] = message.useMessage()
  const [loadedQuote, setLoadedQuote] = useState<Quote|null>(null)
  const [productsData, setProductsData] = useState<any[]>([]);
  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

  useEffect(() => {
      getProducts() // time problem: gets loaded even if the modal isnt showed.
    }, [])

    useEffect(() => {      
      const tempSelectedProductsData:any[] = [];
      loadedQuote?.items.forEach((itemLoaded) => {
          productsData.forEach((item)=>{
            if(item.title === itemLoaded.product_name){ // id should exist in response? // so far matching by title
              tempSelectedProductsData.push(item.key)
            }
        })
      })
      setTargetKeys(tempSelectedProductsData);

    }, [productsData,loadedQuote])

  useEffect(() => {
    if(props.quoteId){
      loadQuote(props.quoteId)
    }
    else{
      setOpenModal(false) // hide form
    }
  }, [props.quoteId])

  const loadQuote = async (quoteId:string) => {
    setIsLoading(true)
    try{
      let quote = await fetchQuote( quoteId )
      setLoadedQuote(quote)
      setOpenModal(true) // present form
    }
    catch(error:any){
      presentError(error.message,messageApi)
    }
    finally{
      setIsLoading(false)
    }
  }

  const onCreate = async (values: any) => {    
    // prepare product items
    let items:QuoteItem[] = []
    values.products.forEach((productItem: any) => {

      let productInfo = getLoadedProductByKey(productItem.toString())
      let tmpObject:QuoteItem = {
          price : productInfo.price,
          product_name : productInfo.title,
          quantity : values['quantity.'+productItem.toString()],
          subtotal : values['quantity.'+productItem.toString()] * productInfo.price
      }
      delete values['quantity.'+productItem.toString()] // patch only needed values
      items.push(tmpObject)
    })
    values.items = items
    
    // prepare customer_info
    let tmpCustomerInfo:CustomerInfo = {
      address:values['customer_info.address'],
      city:values['customer_info.city'],
      country:values['customer_info.country'],
      email:values['customer_info.email'],
      name:values['customer_info.name'],
      phone:values['customer_info.phone']
    }

    delete values.products // patch only needed values
    delete values['customer_info.address']
    delete values['customer_info.city']
    delete values['customer_info.country']
    delete values['customer_info.email']
    delete values['customer_info.name']
    delete values['customer_info.phone']

    values.customer_info = tmpCustomerInfo

    values.total = Number(values.subtotal) + Number(values.total_tax)

    try{
      if(values.id && values.id.length > 0){
        await patchquote(values)
      }
      else{
        await createquote(values)
      }
      props.triggerReloadOfQoutes()
      closeModal()
    }
    catch(error:any){
      presentError(error.message,messageApi)
    }    
  }

  const closeModal = () => {
    setLoadedQuote(null)
    props.resetModalBySettingQuoteIdToNull(null) // needed on update Quote
    setOpenModal(false) // needed on create Quote
  }

  const getLoadedProductByKey = (key:string) => {
    let objIndex = productsData.findIndex(obj => obj.key === key)
    return productsData[objIndex]
  }

  const getQuantityByKey = (key:string) => {
    let productData = getLoadedProductByKey(key) // title is needed
    let objIndex = loadedQuote?.items.findIndex(obj => obj.product_name === productData.title) // matching by title should done by id
    if(objIndex !== undefined){
      return loadedQuote?.items[objIndex]?.quantity?loadedQuote?.items[objIndex]?.quantity:1
    }
    else{
      return 1
    }
  }

  const getProducts = async () => {

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

  const filterOption = (inputValue: string, option: RecordType) =>
    option.title.toLocaleLowerCase().indexOf(inputValue.toLocaleLowerCase()) > -1

  const handleChange: TransferProps['onChange'] = (newTargetKeys) => {
    setTargetKeys(newTargetKeys)
  }

  const handleSearch: TransferProps['onSearch'] = (dir, value) => {
    //console.log('search:', dir, value);
  }

  const calculateTotals = (values:any) => {

    let subtotal:number = 0
    values.products.forEach((productItem: any) => {
      let productInfo = getLoadedProductByKey(productItem.toString())
      subtotal += Number(values['quantity.'+productItem.toString()]) * Number(productInfo.price)
    })
    form.setFieldValue('subtotal',subtotal)
    form.setFieldValue('total', (Number(form.getFieldValue('total_tax')) + Number(subtotal))) 
  }


  return (
    <>
      {messageContextHolder}
      <Button data-testid="create_quote_button" type="primary" className="m-10 ml-0" onClick={() => setOpenModal(true)}>
        Create Quote
      </Button>

      <Modal
        open={openModal}
        title={loadedQuote?"Update Quote":"Create a new Quote"}
        okText={loadedQuote?"Update":"Create"}
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => { closeModal() }}
        destroyOnClose
        modalRender={(dom) => (
          <Spin spinning={isLoading} ><Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            initialValues={{ modifier: 'public' }}
            clearOnDestroy
            onFinish={(values) => onCreate(values)}
            onValuesChange={(values,all) => calculateTotals(all)}
          >
            {dom}
          </Form>
          </Spin>
        )}
      >
        <div data-testid="modal_form">
          <Form.Item
            name="id"
            label="id"
            initialValue={loadedQuote?.id}
            hidden={true}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="customer_info.address"
            label="address"
            initialValue={loadedQuote?.customer_info.address}
            rules={[{ required: true, message: 'Please input the address!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="customer_info.city"
            label="city"
            initialValue={loadedQuote?.customer_info.city}
            rules={[{ required: true, message: 'Please input the city!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="customer_info.country"
            label="country"
            initialValue={loadedQuote?.customer_info.country}
            rules={[{ required: true, message: 'Please input the country!' }]}
          >
            <Select>
              <Select.Option value="">Should Contain a loaded List</Select.Option>
              <Select.Option value="Cyprus">Cyprus</Select.Option>
              <Select.Option value="Italy">Italy</Select.Option>
              <Select.Option value="Kuwait">Kuwait</Select.Option>
            </Select> 
          </Form.Item>

          <Form.Item
            name="customer_info.email"
            label="email"
            initialValue={loadedQuote?.customer_info.email}
            rules={[{ required: true, message: 'Please input the email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="customer_info.name"
            label="name"
            initialValue={loadedQuote?.customer_info.name}
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="customer_info.phone"
            label="phone"
            initialValue={loadedQuote?.customer_info.email}
            rules={[{ required: true, message: 'Please input the phone!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="description" 
            label="description"
            initialValue={loadedQuote?.description}
            rules={[{ required: true, message: 'Please input the description!' }]}  
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="status"
            label="status"
            initialValue={loadedQuote?.status}
            rules={[{ required: true, message: 'Please input the status!' }]}
          >
            <Select>
              <Select.Option value="">Select Status</Select.Option>
              {QuoteStatusFilterData.map((quoteType, index)=>{ 
                return <Select.Option key={index} value={quoteType}>{quoteType}</Select.Option>
              })}
            </Select> 
          </Form.Item>

          <Form.Item
            name="products"
            label="products"
            initialValue={targetKeys}
            rules={[{ required: true, message: 'Please input the produts!' }]}>
            <Transfer
              dataSource={productsData}
              showSearch
              filterOption={filterOption}
              targetKeys={targetKeys}
              onChange={handleChange}
              onSearch={handleSearch}
              render={(item) => item.title}
            />
          </Form.Item>

          {targetKeys?.map((item,index)=>{
            let product = getLoadedProductByKey(item.toString())
            return <Form.Item
              key={index}
              name={'quantity.' + product.key}
              label={product.title}
              initialValue={getQuantityByKey(item.toString())}
              rules={[{ required: true, message: 'Please input the quantity!' }]}
            >
              <InputNumber min={1} max={100000} />
            </Form.Item> 
          })}

          <Form.Item
            name="subtotal"
            label="subtotal"
            initialValue={loadedQuote?.subtotal}
            rules={[{ required: true, message: 'Please input the subtotal!' }]}
          >
            <Input disabled={true} />
          </Form.Item>

          <Form.Item
            name="total_tax"
            label="tax"
            initialValue={loadedQuote?.total_tax}
            rules={[{ required: true, message: 'Please input the total_tax!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="total"
            label="total"
            initialValue={loadedQuote?.total}
            rules={[{ required: true, message: 'Please input the total!' }]}
          >
            <Input disabled={true} />
          </Form.Item>
        </div>
      </Modal>
    </>
    );
}

export default QuoteForm;
