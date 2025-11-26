import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as DownloadIcon } from '../assets/icons/import.svg';
import { ReactComponent as EyeIcon } from '../assets/icons/eye.svg';
import { ReactComponent as ArrowTop } from '../assets/icons/table-arrow-top.svg';
import { ReactComponent as ArrowDown } from '../assets/icons/table-arrow-down.svg';
import { ReactComponent as ArrowsBoth } from '../assets/icons/table-arrow-both-way.svg';

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
          <ArrowsBoth />
        </span>
      );
    }

    return (
      <span className={className}>
        {sortConfig.direction === 'asc' ? <ArrowTop /> : <ArrowDown />}
      </span>
    );
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
                          <SortIcon column="label" />
                        </div>
                      </th>
                      <th onClick={() => handleSort('status')}>
                        <div className="header-content">
                          {t('Onboarding.Status')}
                          <SortIcon column="status" />
                        </div>
                      </th>
                      <th>{t('Onboarding.Actions')}</th>
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

Onboarding.propTypes = {
  request: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  requesting: PropTypes.bool,
  onPrevious: PropTypes.func.isRequired,
};
