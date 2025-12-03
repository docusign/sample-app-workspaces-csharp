import React from 'react';
import './SkeletonSelectDocuments.scss';

const AgreementRowSkeleton = () => (
  <div className="skeleton-agreement-row">
    <div className="skeleton-checkbox" />
    <div className="skeleton-text" />
  </div>
);

export const SkeletonSelectDocuments = () => {
  return (
    <div className="col-lg-8 skeleton-select-documents">
      <div className="form-holder bg-white">
        <div className="skeleton-title" />

        <div className="skeleton-subtitle" />
        <div className="select-form mb-4">
          <AgreementRowSkeleton />
          <AgreementRowSkeleton />
          <AgreementRowSkeleton />
        </div>

        <div className="skeleton-subtitle" />
        <div className="select-form">
          <AgreementRowSkeleton />
          <AgreementRowSkeleton />
        </div>

        <div className="skeleton-buttons">
          <div className="skeleton-button" />
          <div className="skeleton-button" />
        </div>
      </div>
    </div>
  );
};
