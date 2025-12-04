import React from 'react';
import './ApiDescriptionSkeleton.scss';

export const ApiDescriptionSkeleton = ({ isBig }) => {
  return (
    <div className="col-lg-4 pt-5 pb-4 behind_scenes">
      <div className="skeleton-container">
        <div className="skeleton-header">
          <div className="skeleton-icon"></div>
        </div>

        {isBig && (
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-line skeleton-line-medium"></div>
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-line skeleton-line-short"></div>

            <div className="skeleton-spacer"></div>
            <div className="skeleton-line skeleton-line-short"></div>
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-spacer"></div>
            <div className="skeleton-line skeleton-line-short"></div>
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-line skeleton-line-medium"></div>
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-line skeleton-line-full"></div>
            <div className="skeleton-line skeleton-line-short"></div>
          </div>
        )}
      </div>
    </div>
  );
};
