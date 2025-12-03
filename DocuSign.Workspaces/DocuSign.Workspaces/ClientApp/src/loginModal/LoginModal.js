import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LoginModal.scss';

function LoginModal({
  isOpen,
  apiBase,
  environments,
  currentStatus,
  onStatusChange,
  onClose,
  resumeAuthStep,
  onClearAuthStep,
  setIsTestAccount,
}) {
  const { t } = useTranslation();
  const defaultEnv = useMemo(() => environments?.[0]?.url || '', [environments]);

  const [selectedAuth, setSelectedAuth] = useState('acg'); // acg | jwt
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountStatus, setAccountStatus] = useState(currentStatus);
  const [settings, setSettings] = useState(null);
  const [acgForm, setAcgForm] = useState({
    basePath: defaultEnv,
    baseUri: '',
    accountId: '',
    userId: '',
  });

  const autoConnectTriggered = useRef(false);
  const latestLoginWithAcg = useRef(null);

  useEffect(() => {
    setIsTestAccount(selectedAuth === 'jwt');
  }, [selectedAuth, setIsTestAccount]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setAccountStatus(currentStatus);
      if (currentStatus?.basePath) {
        setAcgForm((prev) => ({ ...prev, basePath: currentStatus.basePath }));
      }

      if (resumeAuthStep === 'jwt') {
        setSelectedAuth('jwt');
      } else {
        setSelectedAuth('acg');
      }
    }
  }, [isOpen, currentStatus, resumeAuthStep]);

  useEffect(() => {
    if (isOpen && resumeAuthStep && accountStatus?.isConnected) {
      onClearAuthStep?.();
      onClose();
    }
  }, [isOpen, resumeAuthStep, accountStatus?.isConnected]);

  useEffect(() => {
    if (!isOpen || resumeAuthStep !== 'acg') {
      autoConnectTriggered.current = false;
      return;
    }
    if (
      selectedAuth !== 'acg' ||
      accountStatus?.isConnected ||
      !accountStatus?.isConsentGranted ||
      autoConnectTriggered.current
    ) {
      return;
    }
    if (!latestLoginWithAcg.current) {
      return;
    }
    autoConnectTriggered.current = true;
    latestLoginWithAcg.current?.();
  }, [
    isOpen,
    resumeAuthStep,
    selectedAuth,
    accountStatus?.isConnected,
    accountStatus?.isConsentGranted,
  ]);

  const normalizeStatus = (statusJson) => ({
    ...statusJson,
    connectedUser: statusJson.connectedUser || statusJson.ConnectedUser || {},
    isConsentGranted:
      typeof statusJson.isConsentGranted === 'boolean'
        ? statusJson.isConsentGranted
        : statusJson.IsConsentGranted,
    isConnected:
      typeof statusJson.isConnected === 'boolean' ? statusJson.isConnected : statusJson.IsConnected,
  });

  const normalizeSettings = (settingsJson) => ({
    ...settingsJson,
    userProfile: settingsJson.userProfile || settingsJson.UserProfile || {},
  });

  const fetchStatusAndSettings = async () => {
    const [statusRes, settingsRes] = await Promise.all([
      fetch(`${apiBase}/api/account/status`, { credentials: 'include' }),
      fetch(`${apiBase}/api/settings`, { credentials: 'include' }),
    ]);

    if (!statusRes.ok) {
      const message = await statusRes.text();
      throw new Error(message || t('LoginModal.Error.UnableToLoadAccountStatus'));
    }
    if (!settingsRes.ok) {
      const message = await settingsRes.text();
      throw new Error(message || t('LoginModal.Error.UnableToLoadSettings'));
    }

    const statusJson = await statusRes.json();
    const settingsJson = await settingsRes.json();

    const normalizedStatus = normalizeStatus(statusJson);
    const normalizedSettings = normalizeSettings(settingsJson);

    setAccountStatus(normalizedStatus);
    onStatusChange(normalizedStatus);
    setSettings(normalizedSettings);
    setAcgForm((prev) => ({
      ...prev,
      basePath: normalizedSettings.basePath || normalizedSettings.BasePath || prev.basePath,
      baseUri: normalizedSettings.baseUri || normalizedSettings.BaseUri || prev.baseUri,
      accountId: normalizedSettings.accountId || normalizedSettings.AccountId || prev.accountId,
      userId: normalizedSettings.userId || normalizedSettings.UserId || prev.userId,
    }));

    return { status: normalizedStatus, settings: normalizedSettings };
  };

  const requestConsent = async (consentType) => {
    setIsLoading(true);
    setError('');
    try {
      const consentBasePath = acgForm.basePath || defaultEnv;
      const response = await fetch(`${apiBase}/api/account/consent/obtain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          basePath: consentBasePath,
          redirectUrl: '/',
          consentType,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || t('LoginModal.Error.UnableToStartConsentFlow'));
      }

      const payload = await response.json();
      if (payload.redirectUrl) {
        document.cookie = 'ds_auth_step=acg-consent; path=/; SameSite=Lax';
        window.location.href = payload.redirectUrl;
        return;
      }

      await fetchStatusAndSettings();
      setSelectedAuth('acg');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const connectTestAccount = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/account/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ authenticationType: 'TestAccount' }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || t('LoginModal.Error.UnableToLoginWithTestAccount'));
      }

      await fetchStatusAndSettings();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultAccountDetails = async (basePath, userId) => {
    const query = new URLSearchParams({ basePath, userId });
    const response = await fetch(`${apiBase}/api/accounts?${query.toString()}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || t('LoginModal.Error.UnableToLoadAccounts'));
    }
    const payload = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new Error(t('LoginModal.Error.NoAccounts'));
    }
    const defaultAccount = payload.find((acct) => acct.isDefault || acct.IsDefault) ?? payload[0];
    return {
      accountId: defaultAccount.accountId || defaultAccount.AccountId,
      baseUri: defaultAccount.baseUri || defaultAccount.BaseUri,
    };
  };

  const performUserAccountConnection = async ({ basePath, baseUri, accountId, userId }) => {
    const response = await fetch(`${apiBase}/api/account/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        authenticationType: 'UserAccount',
        basePath,
        baseUri,
        accountId,
        userId,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || t('LoginModal.Error.UnableToConnectAccount'));
    }

    await fetchStatusAndSettings();
    onClearAuthStep?.();
    onClose();
  };

  const loginWithAcg = async () => {
    setError('');
    let latestSettings = settings;
    let consentGranted = accountStatus?.isConsentGranted;

    if (!consentGranted || !latestSettings) {
      try {
        const latest = await fetchStatusAndSettings();
        latestSettings = latest?.settings ?? latestSettings;
        consentGranted = latest?.status?.isConsentGranted ?? consentGranted;
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    if (!consentGranted) {
      await requestConsent('Admin');
      return;
    }

    setIsLoading(true);
    try {
      const basePath =
        latestSettings?.basePath || latestSettings?.BasePath || acgForm.basePath || defaultEnv;
      const userId = latestSettings?.userId || latestSettings?.UserId || acgForm.userId;

      if (!basePath || !userId) {
        throw new Error(t('LoginModal.Error.IncompleteConsent'));
      }

      const { accountId, baseUri } = await fetchDefaultAccountDetails(basePath, userId);
      setAcgForm((prev) => ({
        ...prev,
        basePath,
        userId,
        accountId,
        baseUri,
      }));

      await performUserAccountConnection({ basePath, baseUri, accountId, userId });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    latestLoginWithAcg.current = loginWithAcg;
  }, [loginWithAcg]);

  const goToSelectedAuthStep = () => {
    if (!selectedAuth) return;
    if (selectedAuth === 'jwt') {
      connectTestAccount();
    } else {
      loginWithAcg();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal__backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <button
          className="auth-modal__close"
          type="button"
          onClick={onClose}
          aria-label={t('Common.Close')}
        >
          <img src="/close_modal.png" alt={t('LoginModal.CloseModal')} />
        </button>
        <div className="auth-modal__header">
          <div>
            <h2>{t('LoginModal.Title')}</h2>
          </div>
        </div>
        <div className="auth-modal__content">
          <p className="auth-modal__description">{t('LoginModal.Description')}</p>
          <div className="auth-modal__options auth-modal__options--radio">
            <label
              className={`auth-option auth-option--radio ${selectedAuth === 'acg' ? 'auth-option--selected' : ''}`}
            >
              <input
                type="radio"
                name="authType"
                value="acg"
                checked={selectedAuth === 'acg'}
                onChange={() => setSelectedAuth('acg')}
              />
              <div>
                <span className="auth-option__title">{t('LoginModal.LoginWithDevAccount')}</span>
              </div>
            </label>
            <label
              className={`auth-option auth-option--radio ${selectedAuth === 'jwt' ? 'auth-option--selected' : ''}`}
            >
              <input
                type="radio"
                name="authType"
                value="jwt"
                checked={selectedAuth === 'jwt'}
                onChange={() => setSelectedAuth('jwt')}
              />
              <div>
                <span className="auth-option__title">
                  {t('LoginModal.ContinueWithTestAccount')}
                </span>
              </div>
            </label>
          </div>
          <p className="auth-modal__note">{t('LoginModal.GetFreeAccount')}</p>
        </div>
        <div className="auth-modal__actions">
          <button className="secondary-btn" type="button" onClick={onClose}>
            {t('Common.Cancel')}
          </button>
          <button
            className="primary-btn"
            type="button"
            onClick={goToSelectedAuthStep}
            disabled={!selectedAuth || isLoading}
          >
            {isLoading ? t('LoginModal.LoggingIn') : t('Common.Login')}
          </button>
        </div>
        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}

export default LoginModal;
