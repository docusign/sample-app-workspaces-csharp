import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as DownloadIcon } from '../../../assets/icons/import.svg';
import { ReactComponent as EyeIcon } from '../../../assets/icons/eye.svg';

const MOCK_DATA = [
  { id: 21, label: 'Engagement Agreement', status: 'Signed', previewUrl: '/preview/engagement' },
  { id: 22, label: 'IRA Products Agreement', status: 'Draft', previewUrl: '/preview/ira' },
  { id: 23, label: 'ETF Products Agreement', status: 'Not signed', previewUrl: '/preview/etf' },
];

export const Onboarding = ({
  request,
  onSave,
  onChange,
  requesting = false,
  errors = {},
  onPrevious,
}) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [listToSign, setListToSign] = useState(MOCK_DATA);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...listToSign].sort((a, b) => {
      const aVal = a[key].toLowerCase();
      const bVal = b[key].toLowerCase();

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setListToSign(sorted);
  };

  const SortIcon = ({ column }) => {
    const isActive = sortConfig.key === column;
    const className = isActive ? 'sort-icon' : 'sort-icon inactive';

    if (!isActive) {
      return (
        <span className={className}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 3L8 5H4L6 3Z" fill="#393242" />
            <path d="M6 9L4 7H8L6 9Z" fill="#393242" />
          </svg>
        </span>
      );
    }

    return (
      <span className={className}>
        {sortConfig.direction === 'asc' ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 3L8 5H4L6 3Z" fill="#393242" />
          </svg>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L4 7H8L6 9Z" fill="#393242" />
          </svg>
        )}
      </span>
    );
  };

  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white pb-5">
        <h2 className="mb-4">Review & confirm documents</h2>

        <form
          onSubmit={(event) => {
            onSave(event);
            setSubmitted(true);
          }}
          className={submitted ? 'was-validated' : ''}
          noValidate
        >
          <div className="select-form">
            <div className="documents-table-wrapper">
              <div className="documents-table-container">
                <table className="documents-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('label')}>
                        <div className="header-content">
                          Envelope Name
                          <SortIcon column="label" />
                        </div>
                      </th>
                      <th onClick={() => handleSort('status')}>
                        <div className="header-content">
                          Status
                          <SortIcon column="status" />
                        </div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listToSign.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.label}</td>
                        <td>{doc.status}</td>
                        <td>
                          <div className="actions-container">
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => window.open(doc.previewUrl, '_blank')}
                              aria-label="Preview"
                            >
                              <EyeIcon />
                            </button>
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => console.log('Download', doc.label)}
                              aria-label="Download"
                            >
                              <DownloadIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

Onboarding.propTypes = {
  request: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  requesting: PropTypes.bool,
  onPrevious: PropTypes.func.isRequired,
};
