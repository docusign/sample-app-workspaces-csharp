import { useTranslation } from 'react-i18next';
import './WorkspaceAccessErrorModal.scss';

function WorkspaceAccessErrorModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="workspace-error-modal__backdrop" role="dialog" aria-modal="true">
      <div className="workspace-error-modal">
        <button
          className="workspace-error-modal__close"
          type="button"
          onClick={onClose}
          aria-label={t('Common.Close')}
        >
          ×
        </button>
        <div className="workspace-error-modal__header">
          <h2>{t('WorkspaceAccessError.Title')}</h2>
        </div>
        <div className="workspace-error-modal__content">
          <p className="workspace-error-modal__description">
            {t('WorkspaceAccessError.Description')}
          </p>
          <div className="workspace-error-modal__cta">
            <a
              href="https://apps-d.docusign.com/workspaces"
              target="_blank"
              rel="noreferrer"
              className="workspace-error-modal__primary-button"
            >
              {t('WorkspaceAccessError.EnableWorkspaces')} →
            </a>
          </div>
          <div className="workspace-error-modal__support">
            <p>{t('WorkspaceAccessError.NeedHelp')}</p>
            <a
              href="https://developers.docusign.com/docs/workspaces-api/"
              target="_blank"
              rel="noreferrer"
              className="workspace-error-modal__link"
            >
              {t('WorkspaceAccessError.ViewDocumentation')} →
            </a>
            <a
              href="https://developers.docusign.com/support/"
              target="_blank"
              rel="noreferrer"
              className="workspace-error-modal__link"
            >
              {t('WorkspaceAccessError.ContactSupport')} →
            </a>
          </div>
        </div>
        <div className="workspace-error-modal__actions">
          <button className="primary-btn" type="button" onClick={onClose}>
            {t('Common.Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceAccessErrorModal;
