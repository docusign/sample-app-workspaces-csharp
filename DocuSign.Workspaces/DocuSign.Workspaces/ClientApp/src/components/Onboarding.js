import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import NeedToContinue from '../components/NeedToContinue';

export const Onboarding = ({ onSave, filesList }) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [listToSign, setListToSign] = useState(filesList);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...listToSign].sort((a, b) => {
      const aVal = a[key]?.toLowerCase();
      const bVal = b[key]?.toLowerCase();

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setListToSign(sorted);
  };

  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white">
        <div className="subtitle1 title_in_container">{t('Onboarding.Title')}</div>

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
                      <th onClick={() => handleSort('name')}>
                        <div className="header-content">{t('Onboarding.Name')}</div>
                      </th>
                      <th onClick={() => handleSort('status')}>
                        <div className="header-content">{t('Onboarding.Status')}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listToSign.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.name}</td>
                        <td>
                          <span className="status_text">
                            {t(`Onboarding.${doc.status}`, doc.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
        <NeedToContinue />
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
