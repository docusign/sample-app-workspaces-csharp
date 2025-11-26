import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ShieldIcon } from '../assets/icons/shield-cross.svg';

export const SomethingWentWrong = ({ tryAgain }) => {
  const { t } = useTranslation();

  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white pb-4">
        <div className="warning-text">
          <div className="warning_icon_size">
            <ShieldIcon />
          </div>
          <span className="ms-3">
            {t('SomethingWent')}
            <span
              style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={tryAgain}
            >
              {t('TryAgain')}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
