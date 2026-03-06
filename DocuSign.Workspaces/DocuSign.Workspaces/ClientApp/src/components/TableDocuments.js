import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import NeedToContinue from '../components/NeedToContinue';
import './TableDocuments.scss';

export const TableDocuments = ({ onSave, listFiles }) => {
  const { t } = useTranslation();
  const { isTestAccount } = useOutletContext();
  const [submitted, setSubmitted] = useState(false);
  const [listPending, setListPending] = useState(listFiles);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 500);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...listPending].sort((a, b) => {
      const aVal = typeof a[key] === 'string' ? a[key]?.toLowerCase() : a[key];
      const bVal = typeof b[key] === 'string' ? b[key]?.toLowerCase() : b[key];

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setListPending(sorted);
  };

  const renderCards = () => {
    return (
      <div className="documents-cards">
        {listPending.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="card-row">
              <span className="card-label">{t('Onboarding.Name').toUpperCase()}</span>
              <span className="card-name-value">{doc.name}</span>
            </div>

            {isTestAccount && (
              <div className="card-row">
                <span className="card-label">{t('TableDocuments.Type').toUpperCase()}</span>
                <span className="card-value">
                  {doc.isSigned ? t('Onboarding.Envelope') : t('Onboarding.WorkspaceDocument')}
                </span>
              </div>
            )}

            {isTestAccount && (
              <div className="card-row">
                <span className="card-label card-label-long">
                  {t('TableDocuments.RequiresSignature').toUpperCase()}
                </span>
                <div>
                  <span
                    className={`card-value-yes ${doc.isSigned ? 'is_need_signature' : 'is_not_need_signature'}`}
                  >
                    {doc.isSigned ? t('Onboarding.Yes') : t('Onboarding.No')}
                  </span>
                </div>
              </div>
            )}

            <div className="card-row">
              <span className="card-label">{t('Onboarding.Status').toUpperCase()}</span>
              <span className="card-value">
                {doc.status === 'sent' ? t('Onboarding.PendingSignature') : doc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = () => {
    return (
      <div className="documents-table-wrapper">
        <div className="documents-table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>
                  <div className="header-content">{t('Onboarding.Name')}</div>
                </th>
                {isTestAccount && (
                  <th onClick={() => handleSort('isSigned')}>
                    <div className="header-content">{t('TableDocuments.Type')}</div>
                  </th>
                )}
                {isTestAccount && (
                  <th onClick={() => handleSort('isSigned')}>
                    <div className="header-content">{t('TableDocuments.RequiresSignature')}</div>
                  </th>
                )}
                <th onClick={() => handleSort('status')}>
                  <div className="header-content">{t('Onboarding.Status')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {listPending.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  {isTestAccount && (
                    <td>
                      {doc.isSigned ? t('Onboarding.Envelope') : t('Onboarding.WorkspaceDocument')}
                    </td>
                  )}
                  {isTestAccount && (
                    <td>
                      <div className={doc.isSigned ? 'is_need_signature' : 'is_not_need_signature'}>
                        {doc.isSigned ? t('Onboarding.Yes') : t('Onboarding.No')}
                      </div>
                    </td>
                  )}
                  <td>{doc.status === 'sent' ? t('Onboarding.PendingSignature') : doc.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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
            {isMobile && isTestAccount ? renderCards() : renderTable()}
          </div>
        </form>
        <NeedToContinue />
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
