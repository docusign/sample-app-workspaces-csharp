import { useTranslation } from 'react-i18next';

const NeedToContinue = () => {
  const { t } = useTranslation();
  return (
    <div className="need_to-row">
      <div>
        <span className="need_to-row__label">{t('NeedToContinue.Text')}</span>
      </div>
      <div>
        <a
          className="need_to__link"
          href="https://apps-d.docusign.com/workspaces"
          target="_blank"
          rel="noreferrer"
        >
          {t('NeedToContinue.Link')}
        </a>
      </div>
    </div>
  );
};

export default NeedToContinue;
