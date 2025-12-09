import React, { useState, useEffect } from 'react';
import './SkeletonTableDocuments.scss';

export const SkeletonTableDocuments = ({ rowCount = 3 }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 500);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderCardsSkeleton = () => {
    return (
      <div className="documents-cards-skeleton">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="document-card-skeleton">
            <div className="card-row-skeleton">
              <div className="skeleton-label_header" />
              <div className="skeleton-value_header" />
            </div>
            <div className="card-row-skeleton">
              <div className="skeleton-label" />
            </div>
            <div className="card-row-skeleton">
              <div className="skeleton-label skeleton-label_medium" />
            </div>
            <div className="card-row-skeleton">
              <div className="skeleton-label" />
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
          <div className="skeleton-two-columns">
            <div className="skeleton-column">
              {Array.from({ length: rowCount }).map((_, index) => (
                <div key={index} className="skeleton-row">
                  <div className="skeleton-table-cell" />
                </div>
              ))}
            </div>
            <div className="skeleton-column">
              {Array.from({ length: rowCount }).map((_, index) => (
                <div key={index} className="skeleton-row">
                  <div className="skeleton-table-cell" />
                </div>
              ))}
            </div>
          </div>
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
