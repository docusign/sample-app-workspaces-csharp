import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { ReactComponent as DownloadIcon } from '../assets/icons/import.svg';
import { ReactComponent as EyeIcon } from '../assets/icons/eye.svg';
import { SortIcon } from '../components/SortIcon';

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
  const { accountStatus } = useOutletContext();
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
      <div className="form-holder bg-white">
        <div className="subtitle1 title_in_container">{t('TableDocuments.Title')}</div>

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
                      {!accountStatus?.isConnected && (
                        <th onClick={() => handleSort('status')}>
                          <div className="header-content">
                            {t('TableDocuments.RequiresSignature')}
                            <SortIcon
                              column="status"
                              key={sortConfig.key}
                              direction={sortConfig.direction}
                            />
                          </div>
                        </th>
                      )}
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
                        {!accountStatus?.isConnected && (
                          <td>{doc.isNeedSign ? t('Common.Yes') : t('Common.No')}</td>
                        )}
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
                              onClick={() => console.log('Download', doc.name)}
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
