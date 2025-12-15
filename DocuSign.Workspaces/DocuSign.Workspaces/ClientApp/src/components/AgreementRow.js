import { useTranslation } from 'react-i18next';

export const AgreementRow = ({ label, checked, onToggle, onPreview }) => {
  const { t } = useTranslation();
  return (
    <div className="agreement-row">
      <label className="agreement-row__label">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="agreement-row__checkbox"
        />
        {label}

        <button onClick={onPreview} className="agreement-row__preview-btn">
          {t('Common.Preview')}
        </button>
      </label>
    </div>
  );
};
