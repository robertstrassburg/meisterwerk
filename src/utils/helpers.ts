import { MessageInstance } from "antd/es/message/interface";
import { QuoteStatus } from "../interfaces/quote";

export const currencyFormat = (num:number) => {
    return num.toFixed(2) + '€'
 }

export const getStatusColor = (status:QuoteStatus) => {
    switch (status) {
      case QuoteStatus.DRAFT:
        return 'yellow'
      case QuoteStatus.EXPIRED:
        return 'black'
      case QuoteStatus.ACCEPTED:
        return 'green'
      case QuoteStatus.SENT:
        return 'orange'
      case QuoteStatus.REJECTED:
        return 'red'
     default:
        return 'blue'
    }
 }

export const presentError = (errMessage:string,msInterface:MessageInstance) => {
    msInterface.open({
      type: 'error',
      content: errMessage,
    });
  };