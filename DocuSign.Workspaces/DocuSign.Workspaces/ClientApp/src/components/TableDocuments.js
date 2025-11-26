import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as DownloadIcon } from '../assets/icons/import.svg';
import { ReactComponent as EyeIcon } from '../assets/icons/eye.svg';
import { SortIcon } from '../components/SortIcon';

// const MOCK_DATA = [
//   { id: 21, label: 'Engagement Agreement', status: 'Signed', previewUrl: '/preview/engagement' },
//   { id: 22, label: 'IRA Products Agreement', status: 'Draft', previewUrl: '/preview/ira' },
//   { id: 23, label: 'ETF Products Agreement', status: 'Not signed', previewUrl: '/preview/etf' },
// ];

export const TableDocuments = ({
  request,
  onSave,
  listFiles,
  onChange,
  requesting = false,
  errors = {},
  onPrevious,
}) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [listPending, setListPending] = useState(listFiles);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...listPending].sort((a, b) => {
      const aVal = a[key].toLowerCase();
      const bVal = b[key].toLowerCase();

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setListPending(sorted);
  };

  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white pb-5">
        <h2 className="mb-4">{t('Onboarding.Title')}</h2>

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
                          {t('Onboarding.EnvelopeName')}
                          <SortIcon
                            column="label"
                            key={sortConfig.key}
                            direction={sortConfig.direction}
                          />
                        </div>
                      </th>
                      <th onClick={() => handleSort('status')}>
                        <div className="header-content">
                          {t('Onboarding.Status')}
                          <SortIcon
                            column="status"
                            key={sortConfig.key}
                            direction={sortConfig.direction}
                          />
                        </div>
                      </th>
                      <th>{t('Onboarding.Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listPending.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.name}</td>
                        <td>{doc.status}</td>
                        <td>
                          <div className="actions-container">
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => window.open(doc.previewUrl, '_blank')}
                              aria-label={t('Onboarding.Preview')}
                            >
                              <EyeIcon />
                            </button>
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => console.log('Download', doc.label)}
                              aria-label={t('Onboarding.Download')}
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

TableDocuments.propTypes = {
  request: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  requesting: PropTypes.bool,
  onPrevious: PropTypes.func.isRequired,
};
