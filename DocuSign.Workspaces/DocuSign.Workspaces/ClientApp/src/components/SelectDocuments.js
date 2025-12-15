import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { AgreementRow } from './AgreementRow';
import { ReactComponent as ArrowRightIcon } from '../assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeftIcon } from '../assets/icons/arrow-left.svg';
const listToSign = [
  {
    id: 21,
    name: 'Engagement Agreement.pdf',
    path: '/Engagement Agreement placeholder.pdf',
  },
  {
    id: 22,
    name: 'IRA Products Agreement.pdf',
    path: '/IRA Products Agreement.pdf',
  },
  {
    id: 23,
    name: 'ETF Products Agreement.pdf',
    path: '/ETF PRODUCTS AGREEMENT.pdf',
  },
];
const uploadRequest = [
  { id: 11, name: 'Pay Stub.pdf', path: '/Tax Return.pdf' },
  { id: 12, name: 'Tax Return.pdf', path: '/Pay Statement.pdf' },
];

export const SelectDocuments = ({ onAddDocuments, requesting = false, onPrevious }) => {
  const [checkedMap, setCheckedMap] = useState(
    Object.fromEntries(
      [...listToSign, ...uploadRequest].map((item) => [item.id, { ...item, isChecked: false }])
    )
  );

  const handlePreview = (file) => {
    if (file && file.file) {
      const fileURL = URL.createObjectURL(file.file);
      window.open(fileURL, '_blank');
    } else if (file && file.path) {
      window.open(file.path, '_blank', 'noopener,noreferrer');
    }
  };
  const toggle = (id) => {
    setCheckedMap((prev) => ({
      ...prev,
      [id]: { ...prev[id], isChecked: !prev[id].isChecked },
    }));
  };
  const { t } = useTranslation();
  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white">
        <h4>{t('AddDocumentsTitle')}</h4>

        <div className="subtitle1 margin_top_bottom">{t('DocumentToSign')}</div>
        <div className="select-form">
          {listToSign.map((item) => (
            <AgreementRow
              key={item.id}
              label={item.name}
              checked={checkedMap[item.id].isChecked}
              onToggle={() => toggle(item.id)}
              onPreview={() => {
                handlePreview(item);
              }}
            />
          ))}
        </div>
        <div className="subtitle1 margin_top_bottom_second">
          {t('UnloadedRequests')}
          <span className="optional-italic">{t('Common.Optional')}</span>
        </div>

        <div className={`select-form `}>
          {uploadRequest.map((item) => (
            <AgreementRow
              key={item.id}
              label={item.name}
              checked={checkedMap[item.id].isChecked}
              onToggle={() => toggle(item.id)}
              onPreview={() => {
                handlePreview(item);
              }}
            />
          ))}
        </div>

        <div className="text-end double_btn">
          <button className="card__cta btn_previous " type="button" onClick={onPrevious}>
            <ArrowLeftIcon className="previous_icon" />
            <span className="btn_previous_text">{t('Common.Previous')}</span>
          </button>
          <button
            className="pill card__cta btn-primary width_100_small_screen"
            type="button"
            onClick={() => {
              const filteredCheckedDocuments = Object.values(checkedMap).filter(
                (item) => item.isChecked
              );
              onAddDocuments(filteredCheckedDocuments);
            }}
            disabled={requesting || !Object.values(checkedMap).some((item) => item.isChecked)}
          >
            {t('AddDocumentsButton')}
            <ArrowRightIcon className="arrow_right_icon" />
          </button>
        </div>
      </div>
    </div>
  );
};
SelectDocuments.propTypes = {
  request: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  requesting: PropTypes.bool,
  onPrevious: PropTypes.func.isRequired,
};
