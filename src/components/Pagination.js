import React from 'react';

const Pagination = ({ totalPages, onPageChange, currentPage }) => {
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    console.error("Invalid totalPages prop:", totalPages);
    return null; // или другое сообщение об ошибке
  }

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    if (totalPages <= 1) return null; // не отображаем пагинацию если всего одна страница
    return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
        <button className="page-link" onClick={() => handlePageClick(page)}>
          {page}
        </button>
      </li>
    ));
  };

  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination">
        {totalPages > 1 && ( // Условное рендеринг
          <>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageClick(Math.max(currentPage - 1, 1))}
                aria-label="Previous"
              >
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            {renderPageNumbers()}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageClick(Math.min(currentPage + 1, totalPages))}
                aria-label="Next"
              >
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;