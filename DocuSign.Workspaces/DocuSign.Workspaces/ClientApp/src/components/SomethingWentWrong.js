import { useTranslation } from 'react-i18next';
import { ReactComponent as ShieldIcon } from '../assets/icons/shield-cross.svg';

export const SomethingWentWrong = ({ tryAgain, message }) => {
  const { t } = useTranslation();

  return (
    <div className="col-lg-8">
      <div className="form-holder form-holder_warning bg-white">
        <div className="warning-text">
          <ShieldIcon className="shield-icon" />
          <span className="warning-text_margin">
            <span className="warning-text-line">
              {t('SomethingWent')}
              <span
                style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={tryAgain}
              >
                {t('TryAgain')}
              </span>
            </span>
            {message ? <span className="warning-text-detail">{message}</span> : null}
          </span>
        </div>
      </div>
    </div>
  );
};
