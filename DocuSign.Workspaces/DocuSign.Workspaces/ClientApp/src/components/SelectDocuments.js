import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { AgreementRow } from './AgreementRow';
import { ReactComponent as ArrowRightIcon } from '../assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeftIcon } from '../assets/icons/arrow-left.svg';

const listToSign = [
  { id: 21, label: 'Engagement Agreement', previewUrl: '/preview/engagement' },
  { id: 22, label: 'IRA Products Agreement', previewUrl: '/preview/ira' },
  { id: 23, label: 'ETF Products Agreement', previewUrl: '/preview/etf' },
];
const uploadRequest = [
  { id: 11, label: 'Pay Stub', previewUrl: '/preview/paystub' },
  { id: 12, label: 'Tax Return', previewUrl: '/preview/taxreturn' },
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
    Object.fromEntries([...listToSign, ...uploadRequest].map((item) => [item.id, false]))
  );

  const toggle = (id) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
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
              checked={checkedMap[item.id]}
              onToggle={() => toggle(item.id)}
              onPreview={() => {
                console.log('Preview:', item.previewUrl);
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
              checked={checkedMap[item.id]}
              onToggle={() => toggle(item.id)}
              onPreview={() => {
                console.log('Preview:', item.previewUrl);
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
            onClick={onAddDocuments}
            disabled={!Object.values(checkedMap).some((item) => item)}
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
