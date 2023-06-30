import { useRef } from 'react';

import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import './Button.css';
import './FlexBox.css';

const usePagingView = () => {
  const itemsPerPage = 5;
  const pagingView = useRef([]);
  const pageNumber = useRef([]);

  const paging = (fullData, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    pagingView.current = fullData.slice(startIndex, endIndex)
  }

  const calculatePageNumber = (fullData) => {
    const pageCount = Math.ceil(fullData.length / itemsPerPage);
    pageNumber.current = [...Array(pageCount).keys()].map((n) => n + 1);
  }

  return {
    pagingView,
    pageNumber,
    paging,
    calculatePageNumber
  }
}

export default usePagingView;