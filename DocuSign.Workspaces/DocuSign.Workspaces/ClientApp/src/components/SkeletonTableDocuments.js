import React, { useState, useEffect } from 'react';
import './SkeletonTableDocuments.scss';

export const SkeletonTableDocuments = ({ rowCount = 3 }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 420);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 420);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderCardsSkeleton = () => {
    return (
      <div className="documents-cards-skeleton">
        {Array.from({ length: rowCount }).map((_, index) => (
          <div key={index} className="document-card-skeleton">
            <div className="card-row-skeleton">
              <div className="skeleton-label" />
              <div className="skeleton-value" />
            </div>
            <div className="card-row-skeleton">
              <div className="skeleton-label" />
              <div className="skeleton-value" />
            </div>
            <div className="card-row-skeleton">
              <div className="skeleton-label" />
              <div className="skeleton-value" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTableSkeleton = () => {
    return (
      <div className="documents-table-wrapper">
        <div className="documents-table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>
                  <div className="skeleton-table-header-cell" />
                </th>
                <th>
                  <div className="skeleton-table-header-cell" />
                </th>
                <th>
                  <div className="skeleton-table-header-cell" />
                </th>
                <th>
                  <div className="skeleton-table-header-cell" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className="skeleton-table-cell" />
                  </td>
                  <td>
                    <div className="skeleton-table-cell" />
                  </td>
                  <td>
                    <div className="skeleton-table-cell" />
                  </td>
                  <td>
                    <div className="skeleton-table-cell" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="col-lg-8 skeleton-table-documents">
      <div className="form-holder bg-white">
        <div className="skeleton-title" />
        <div className="select-form">
          {isMobile ? renderCardsSkeleton() : renderTableSkeleton()}
        </div>
      </div>
    </div>
  );
};
