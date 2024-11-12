import { useEffect } from 'react';
import QuoteListing from './components/quoteList';

function App() {

  useEffect(() => {
    }, []);

  return (
    <div className=" max-w-[1000px] m-auto pl-4 pr-4">
      <h1 className="p-4">Quotes</h1>
      <QuoteListing />
    </div>
  );

}

export default App;
