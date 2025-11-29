import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { AgreementRow } from './AgreementRow';
import { ReactComponent as ArrowRightIcon } from '../assets/icons/arrow-right.svg';
import { ReactComponent as ArrowLeftIcon } from '../assets/icons/arrow-left.svg';
import { ReactComponent as Warning2Icon } from '../assets/icons/warning-2.svg';
const listToSign = [
  {
    id: 21,
    name: '4Engagement Agreement.pdf',
    path: '/Engagement Agreement placeholder.pdf',
  },
  {
    id: 22,
    name: '4IRA Products Agreement.pdf',
    path: '/IRA Products Agreement.pdf',
  },
  {
    id: 23,
    name: '4ETF Products Agreement.pdf',
    path: '/ETF PRODUCTS AGREEMENT.pdf',
  },
];
const uploadRequest = [
  { id: 11, name: '4Pay Stub.pdf', path: '/Tax Return.pdf' },
  { id: 12, name: '4Tax Return.pdf', path: '/Pay Statement.pdf' },
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
  const { accountStatus } = useOutletContext();
  const [checkedMap, setCheckedMap] = useState(
    Object.fromEntries(
      [...listToSign, ...uploadRequest].map((item) => [item.id, { ...item, isChecked: false }])
    )
  );

  useEffect(() => {
    console.log('<<<< accountStatus', accountStatus);
    // if (!accountStatus?.isConnected) {
    // }
  }, [accountStatus]);
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
        <h4 className="mb-5">{t('AddDocumentsTitle')}</h4>

        <div className="subtitle1 mb-4">{t('DocumentToSign')}</div>
        <div className="select-form mb-5">
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
        <div className="subtitle1  mb-2">
          {t('UnloadedRequests')}
          <span className="optional-italic"> (optional)</span>
        </div>

        {!accountStatus?.isConnected && (
          <div className="attention_block mb-4">
            <Warning2Icon /> Document selection is available only for personal accounts
          </div>
        )}

        <div className={`select-form ${!accountStatus?.isConnected ? 'disabled-block' : ''}`}>
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

        <div className="text-end">
          <button className="card__cta btn_previous" type="button" onClick={onPrevious}>
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
