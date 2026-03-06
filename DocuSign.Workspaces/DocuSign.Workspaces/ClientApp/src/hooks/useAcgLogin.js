import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useAcgLogin = (apiBase, defaultEnvironment) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSettings = useCallback(async () => {
    const res = await fetch(`${apiBase}/api/settings`, { credentials: 'include' });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || t('LoginModal.Error.UnableToLoadSettings'));
    }
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Settings API returned invalid response format');
    }
    return await res.json();
  }, [apiBase, t]);

  const fetchStatus = useCallback(async () => {
    const res = await fetch(`${apiBase}/api/account/status`, { credentials: 'include' });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || t('LoginModal.Error.UnableToLoadAccountStatus'));
    }
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Status API returned invalid response format');
    }
    const statusJson = await res.json();
    return {
      ...statusJson,
      connectedUser: statusJson.connectedUser || statusJson.ConnectedUser || {},
      isConsentGranted:
        typeof statusJson.isConsentGranted === 'boolean'
          ? statusJson.isConsentGranted
          : statusJson.IsConsentGranted,
      isConnected:
        typeof statusJson.isConnected === 'boolean' ? statusJson.isConnected : statusJson.IsConnected,
    };
  }, [apiBase, t]);

  const requestConsent = useCallback(
    async (basePath, consentType = 'Individual') => {
      const response = await fetch(`${apiBase}/api/account/consent/obtain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          basePath: basePath || defaultEnvironment,
          redirectUrl: '/',
          consentType,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || t('LoginModal.Error.UnableToStartConsentFlow'));
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Consent API returned invalid response format');
      }

      const payload = await response.json();
      if (payload.redirectUrl) {
        document.cookie = 'ds_auth_step=acg-consent; path=/; SameSite=Lax';
        window.location.href = payload.redirectUrl;
        return true;
      }
      return false;
    },
    [apiBase, defaultEnvironment, t]
  );

  const fetchDefaultAccountDetails = useCallback(
    async (basePath, userId) => {
      const query = new URLSearchParams({ basePath, userId });
      const response = await fetch(`${apiBase}/api/accounts?${query.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || t('LoginModal.Error.UnableToLoadAccounts'));
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Accounts API returned invalid response format');
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
    },
    [apiBase, t]
  );

  const performUserAccountConnection = useCallback(
    async ({ basePath, baseUri, accountId, userId }) => {
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
    },
    [apiBase, t]
  );

  const loginWithAcg = useCallback(
    async (onSuccess) => {
      setIsLoading(true);
      setError('');

      try {
        const status = await fetchStatus();
        
        if (!status.isConsentGranted) {
          await requestConsent(defaultEnvironment);
          return; // Will redirect
        }

        const settings = await fetchSettings();
        const basePath = settings.basePath || settings.BasePath || defaultEnvironment;
        const userId = settings.userId || settings.UserId;

        if (!basePath || !userId) {
          throw new Error(t('LoginModal.Error.IncompleteConsent'));
        }

        const { accountId, baseUri } = await fetchDefaultAccountDetails(basePath, userId);
        await performUserAccountConnection({ basePath, baseUri, accountId, userId });

        if (onSuccess) {
          await onSuccess();
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchStatus,
      fetchSettings,
      requestConsent,
      fetchDefaultAccountDetails,
      performUserAccountConnection,
      defaultEnvironment,
      t,
    ]
  );

  return {
    isLoading,
    error,
    setError,
    loginWithAcg,
    fetchStatus,
    fetchSettings,
    requestConsent,
    fetchDefaultAccountDetails,
    performUserAccountConnection,
  };
};
