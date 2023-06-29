
import React, { useEffect, useState } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import './Button.css';
import './FlexBox.css';
import usePagingView from './Paging.jsx';

const CustomPagination = ({ data, triggerView }) => {
  // State paginate
  const [pageNumbers, setPageNumbers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // Change page number
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageNumbers[pageNumbers.length - 1]) {
      setCurrentPage(pageNumber);
      triggerView(pageNumber);
    }
  };
  // Controll pagination
  const { pageNumber, calculatePageNumber } = usePagingView();
  useEffect(() => {
    calculatePageNumber(data);
    setPageNumbers(pageNumber.current);
  }, [data, currentPage]);

  return (
    <div className="pagination">
      <Pagination>
        {
          currentPage > 1
            ? (
              <>
                <Pagination.First onClick={() => handlePageChange(1)} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />
                <Pagination.Item onClick={() => handlePageChange(1)}>{1}</Pagination.Item>
                <Pagination.Ellipsis />
              </>
            )
            : (
              ''
            )
        }
        {
          pageNumbers.map((pageNumber) => {
            if (currentPage == pageNumber == 1
              || currentPage == pageNumber == pageNumbers[pageNumbers.length - 1]
              || (pageNumber > 1 && pageNumber < pageNumbers[pageNumbers.length - 1])) {
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}>
                  {pageNumber}
                </Pagination.Item>
              );
            }
          })
        }
        {
          currentPage < pageNumbers[pageNumbers.length - 1]
            ? (
              <>
                <Pagination.Ellipsis />
                <Pagination.Item onClick={() => handlePageChange(pageNumbers[pageNumbers.length - 1])}>{pageNumbers[pageNumbers.length - 1]}</Pagination.Item>
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
                <Pagination.Last onClick={() => handlePageChange(pageNumbers[pageNumbers.length - 1])} />
              </>
            )
            : (
              ''
            )
        }
      </Pagination>
    </div>
  )
}

export default CustomPagination;