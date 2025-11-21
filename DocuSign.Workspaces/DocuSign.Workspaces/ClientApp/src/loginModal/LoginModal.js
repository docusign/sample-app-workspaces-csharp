import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LoginModal.scss';

function LoginModal({
  isOpen,
  apiBase,
  environments,
  currentStatus,
  onStatusChange,
  onClose,
  onLogout,
  resumeAuthStep,
  onClearAuthStep,
}) {
  const { t } = useTranslation();
  const defaultEnv = useMemo(() => environments?.[0]?.url || '', [environments]);

  const [modalStage, setModalStage] = useState('choice'); // choice | step | profile
  const [selectedAuth, setSelectedAuth] = useState(null); // acg | jwt
  const [environment, setEnvironment] = useState(defaultEnv);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [accountStatus, setAccountStatus] = useState(currentStatus);
  const [settings, setSettings] = useState(null);
  const [acgForm, setAcgForm] = useState({
    basePath: defaultEnv,
    baseUri: '',
    accountId: '',
    userId: '',
  });
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    countryCode: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (isOpen) {
      setError('');
      setAccountStatus(currentStatus);
      if (currentStatus?.basePath) {
        setAcgForm((prev) => ({ ...prev, basePath: currentStatus.basePath }));
        setEnvironment(currentStatus.basePath);
      }

      if (resumeAuthStep === 'acg' && currentStatus?.isConsentGranted) {
        setModalStage('step');
        setSelectedAuth('acg');
      } else {
        setModalStage('choice');
        setSelectedAuth(null);
      }
    }
  }, [isOpen, currentStatus, defaultEnv, resumeAuthStep]);

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
      throw new Error(message || 'Unable to load account status.');
    }
    if (!settingsRes.ok) {
      const message = await settingsRes.text();
      throw new Error(message || 'Unable to load settings.');
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
    setProfileForm({
      fullName:
        normalizedSettings.userProfile?.fullName || normalizedSettings.userProfile?.FullName || '',
      email: normalizedSettings.userProfile?.email || normalizedSettings.userProfile?.Email || '',
      countryCode:
        normalizedSettings.userProfile?.countryCode ||
        normalizedSettings.userProfile?.CountryCode ||
        '',
      phoneNumber:
        normalizedSettings.userProfile?.phoneNumber ||
        normalizedSettings.userProfile?.PhoneNumber ||
        '',
    });

    return { status: normalizedStatus, settings: normalizedSettings };
  };

  const requestConsent = async (consentType) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/account/consent/obtain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          basePath: environment,
          redirectUrl: '/',
          consentType,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to start consent flow.');
      }

      const payload = await response.json();
      if (payload.redirectUrl) {
        document.cookie = 'ds_auth_step=acg-consent; path=/; SameSite=Lax';
        window.location.href = payload.redirectUrl;
        return;
      }

      // If no redirect was returned, refresh status/settings and step forward.
      await fetchStatusAndSettings();
      setSelectedAuth('acg');
      setModalStage('step');
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
        throw new Error(message || 'Unable to log in with test account.');
      }

      await fetchStatusAndSettings();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async (overrideBasePath, overrideUserId) => {
    setAccountsLoading(true);
    setError('');
    try {
      const basePath = overrideBasePath || acgForm.basePath;
      const userId = overrideUserId || acgForm.userId;
      const query = new URLSearchParams({ basePath, userId });
      const response = await fetch(`${apiBase}/api/accounts?${query.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to load accounts.');
      }
      const payload = await response.json();
      setAccounts(payload);
      const defaultAccount = payload.find((a) => a.isDefault || a.IsDefault);
      if (defaultAccount) {
        setAcgForm((prev) => ({
          ...prev,
          accountId: defaultAccount.accountId || defaultAccount.AccountId,
          baseUri: defaultAccount.baseUri || defaultAccount.BaseUri,
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAccountsLoading(false);
    }
  };

  const connectUserAccount = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/account/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          authenticationType: 'UserAccount',
          basePath: acgForm.basePath,
          baseUri: acgForm.baseUri,
          accountId: acgForm.accountId,
          userId: acgForm.userId,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to connect account.');
      }

      await fetchStatusAndSettings();
      onClearAuthStep?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...settings,
        userProfile: {
          fullName: profileForm.fullName,
          email: profileForm.email,
          countryCode: profileForm.countryCode,
          phoneNumber: profileForm.phoneNumber,
        },
      };

      const response = await fetch(`${apiBase}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to save settings.');
      }

      const updated = await response.json();
      setSettings(updated);
      await fetchStatusAndSettings();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEnvironmentChange = (value) => {
    setEnvironment(value);
    setAcgForm((prev) => ({ ...prev, basePath: value }));
  };

  const handleAcgFormChange = (field, value) => {
    setAcgForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (
      isOpen &&
      modalStage === 'step' &&
      selectedAuth === 'acg' &&
      accountStatus?.isConsentGranted
    ) {
      (async () => {
        const result = await fetchStatusAndSettings();
        const consented = result?.status?.isConsentGranted || accountStatus?.isConsentGranted;
        const userIdFromStatus = result?.status?.userId || result?.settings?.userId;
        if (userIdFromStatus && !acgForm.userId) {
          setAcgForm((prev) => ({ ...prev, userId: userIdFromStatus }));
        }
        const effectiveUserId = acgForm.userId || userIdFromStatus;
        if (consented && effectiveUserId) {
          await loadAccounts(acgForm.basePath, effectiveUserId);
        }
      })();
    }
  }, [isOpen, modalStage, selectedAuth]);

  if (!isOpen) return null;

  return (
    <div className="auth-modal__backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <div className="auth-modal__header">
          <div>
            <p className="auth-modal__eyebrow">{t('Authentication')}</p>
            <h2>
              {modalStage === 'choice'
                ? t('ChooseHowToLogIn')
                : modalStage === 'profile'
                  ? t('Step3')
                  : selectedAuth === 'acg' && accountStatus?.isConsentGranted
                    ? t('Step2')
                    : t('Step1')}
            </h2>
          </div>
          <button
            className="auth-modal__close"
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
          >
            ×
          </button>
        </div>

        {modalStage === 'choice' && (
          <>
            <p>{t('SelectAuthPath')}</p>
            <div className="auth-modal__options">
              <button
                className="auth-option"
                type="button"
                onClick={() => {
                  setSelectedAuth('acg');
                  setModalStage('step');
                }}
              >
                <span className="auth-option__title">{t('ConnectDocuSignAccount')}</span>
                <span className="auth-option__description">{t('ACGDescription')}</span>
              </button>
              <button
                className="auth-option"
                type="button"
                onClick={() => {
                  setSelectedAuth('jwt');
                  setModalStage('step');
                }}
              >
                <span className="auth-option__title">{t('LoginWithTestAccount')}</span>
                <span className="auth-option__description">{t('JWTDescription')}</span>
              </button>
            </div>
          </>
        )}

        {modalStage === 'step' && selectedAuth === 'acg' && (
          <div className="auth-step">
            {accountStatus?.isConsentGranted ? (
              <>
                <p className="auth-step__intro">{t('ConsentGranted')}</p>
                <div className="profile-form">
                  <label>
                    <span>{t('BasePath')}</span>
                    <input
                      type="text"
                      value={acgForm.basePath}
                      onChange={(e) => handleAcgFormChange('basePath', e.target.value)}
                    />
                  </label>
                  <label>
                    <span>{t('UserID')}</span>
                    <input
                      type="text"
                      value={acgForm.userId}
                      onChange={(e) => handleAcgFormChange('userId', e.target.value)}
                    />
                  </label>
                  <div className="auth-step__actions single">
                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={loadAccounts}
                      disabled={accountsLoading}
                    >
                      {accountsLoading ? t('Loading') : t('LoadAccounts')}
                    </button>
                  </div>
                  {accounts.length > 0 && (
                    <>
                      <label>
                        <span>{t('Account')}</span>
                        <select
                          value={acgForm.accountId}
                          onChange={(e) => {
                            const selected = accounts.find(
                              (a) => (a.accountId || a.AccountId) === e.target.value
                            );
                            handleAcgFormChange('accountId', e.target.value);
                            handleAcgFormChange(
                              'baseUri',
                              selected?.baseUri || selected?.BaseUri || ''
                            );
                          }}
                        >
                          <option value="">{t('SelectAnAccount')}</option>
                          {accounts.map((acct) => (
                            <option
                              key={acct.accountId || acct.AccountId}
                              value={acct.accountId || acct.AccountId}
                            >
                              {(acct.accountName || acct.AccountName) ??
                                (acct.accountId || acct.AccountId)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>{t('BaseURI')}</span>
                        <input
                          type="text"
                          value={acgForm.baseUri}
                          onChange={(e) => handleAcgFormChange('baseUri', e.target.value)}
                        />
                      </label>
                    </>
                  )}
                </div>
                <div className="auth-step__actions">
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={fetchStatusAndSettings}
                    disabled={isLoading}
                  >
                    {t('RefreshStatus')}
                  </button>
                  <button
                    className="primary-btn"
                    type="button"
                    disabled={
                      isLoading || !acgForm.accountId || !acgForm.baseUri || !acgForm.userId
                    }
                    onClick={connectUserAccount}
                  >
                    {isLoading ? t('Connecting') : t('ConnectAccount')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="auth-step__intro">{t('PickEnvironment')}</p>
                <div className="environment-picker">
                  {environments.map((env) => (
                    <label key={env.key} className="environment-option">
                      <input
                        type="radio"
                        name="environment"
                        value={env.url}
                        checked={environment === env.url}
                        onChange={(e) => handleEnvironmentChange(e.target.value)}
                        disabled={isLoading}
                      />
                      <div>
                        <span className="environment-option__title">{env.label}</span>
                        <span className="environment-option__subtitle">{env.url}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="auth-step__actions">
                  <button
                    className="secondary-btn"
                    type="button"
                    disabled={isLoading}
                    onClick={() => requestConsent('Individual')}
                  >
                    {isLoading ? t('Connecting') : t('GrantUserConsent')}
                  </button>
                  <button
                    className="primary-btn"
                    type="button"
                    disabled={isLoading}
                    onClick={() => requestConsent('Admin')}
                  >
                    {isLoading ? t('Connecting') : t('GrantAdminConsent')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {modalStage === 'step' && selectedAuth === 'jwt' && (
          <div className="auth-step">
            <p className="auth-step__intro">{t('ContinueWithJWT')}</p>
            <div className="auth-step__actions single">
              <button
                className="primary-btn"
                type="button"
                disabled={isLoading}
                onClick={connectTestAccount}
              >
                {isLoading ? t('Connecting') : t('ConnectTestAccount')}
              </button>
            </div>
          </div>
        )}

        {modalStage === 'profile' && (
          <div className="auth-step">
            <p className="auth-step__intro">{t('Connected')}</p>
            {accountStatus && (
              <div className="connected-summary">
                <div>
                  <span className="summary-label">{t('User')}</span>
                  <span className="summary-value">
                    {accountStatus.connectedUser?.name || t('Unknown')}
                  </span>
                </div>
                <div>
                  <span className="summary-label">{t('Email')}</span>
                  <span className="summary-value">
                    {accountStatus.connectedUser?.email || t('Unknown')}
                  </span>
                </div>
                <div>
                  <span className="summary-label">{t('Account')}</span>
                  <span className="summary-value">
                    {accountStatus.connectedUser?.accountName || t('Unknown')}
                  </span>
                </div>
              </div>
            )}
            <div className="profile-form">
              <label>
                <span>{t('FullName')}</span>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                />
              </label>
              <label>
                <span>{t('Email')}</span>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </label>
              <div className="profile-form__row">
                <label>
                  <span>{t('CountryCode')}</span>
                  <input
                    type="text"
                    value={profileForm.countryCode}
                    onChange={(e) => handleProfileChange('countryCode', e.target.value)}
                  />
                </label>
                <label>
                  <span>{t('PhoneNumber')}</span>
                  <input
                    type="text"
                    value={profileForm.phoneNumber}
                    onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="auth-step__actions">
              <button className="secondary-btn" type="button" onClick={onClose} disabled={saving}>
                {t('Close')}
              </button>
              <button className="secondary-btn" type="button" onClick={onLogout} disabled={saving}>
                {t('Logout')}
              </button>
              <button
                className="primary-btn"
                type="button"
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? t('Saving') : t('SaveSettings')}
              </button>
            </div>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}

export default LoginModal;
