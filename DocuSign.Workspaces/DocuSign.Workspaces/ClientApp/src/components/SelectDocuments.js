import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { AgreementRow } from './AgreementRow';
import { ReactComponent as ArrowRightIcon } from '../assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeftIcon } from '../assets/icons/arrow-left.svg';
const listToSign = [
  {
    id: 21,
    label: '2Engagement Agreement.pdf',
    path: '/Engagement Agreement placeholder.pdf',
  },
  {
    id: 22,
    label: '2IRA Products Agreement.pdf',
    path: '/IRA Products Agreement.pdf',
  },
  {
    id: 23,
    label: '2ETF Products Agreement.pdf',
    path: '/ETF PRODUCTS AGREEMENT.pdf',
  },
];
const uploadRequest = [
  { id: 11, label: '2Pay Stub.pdf', path: '/Tax Return.pdf' },
  { id: 12, label: '2Tax Return.pdf', path: '/Pay Statement.pdf' },
];

export const SelectDocuments = ({
  request,
  onSave,
  onAddDocuments,
  onChange,
  requesting = false,
  errors = {},
  onPrevious,
}) => {
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
      <div className="form-holder bg-white pb-5">
        <h2 className="mb-4">{t('AddDocumentsTitle')}</h2>

        <p className="form-second-title">{t('DocumentToSign')}</p>
        <div className="select-form">
          {listToSign.map((item) => (
            <AgreementRow
              key={item.id}
              label={item.label}
              checked={checkedMap[item.id].isChecked}
              onToggle={() => toggle(item.id)}
              onPreview={() => {
                handlePreview(item);
              }}
            />
          ))}
        </div>
        <p className="form-second-title">{t('UnloadedRequests')}</p>

        <div className="select-form">
          {uploadRequest.map((item) => (
            <AgreementRow
              key={item.id}
              label={item.label}
              checked={checkedMap[item.id].isChecked}
              onToggle={() => toggle(item.id)}
              onPreview={() => {
                handlePreview(item);
              }}
            />
          ))}
        </div>

        <div className="text-end">
          <button className=" card__cta btn_previous" type="button" onClick={onPrevious}>
            <ArrowLeftIcon className="previous_icon" />
            Previous
          </button>
          <button
            className="pill card__cta btn-primary"
            type="button"
            onClick={() => {
              const filteredCheckedDocuments = Object.values(checkedMap).filter(
                (item) => item.isChecked
              );
              console.log('<<< filteredCheckedDocuments', filteredCheckedDocuments);
              onAddDocuments(filteredCheckedDocuments);
            }}
            disabled={!Object.values(checkedMap).some((item) => item.isChecked)}
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
