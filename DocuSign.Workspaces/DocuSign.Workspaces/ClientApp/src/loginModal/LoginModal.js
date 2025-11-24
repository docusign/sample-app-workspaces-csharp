import React, { useEffect, useMemo, useRef, useState } from 'react';
import './LoginModal.css';

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
    const defaultEnv = useMemo(() => environments?.[0]?.url || '', [environments]);

    const [modalStage, setModalStage] = useState('choice'); // choice | step | profile
    const [selectedAuth, setSelectedAuth] = useState('acg'); // acg | jwt
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

    const autoConnectTriggered = useRef(false);
    const latestLoginWithAcg = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setError('');
            setAccountStatus(currentStatus);
            if (currentStatus?.basePath) {
                setAcgForm((prev) => ({ ...prev, basePath: currentStatus.basePath }));
                setEnvironment(currentStatus.basePath);
            }

            setModalStage('choice');
            if (resumeAuthStep === 'jwt') {
                setSelectedAuth('jwt');
            } else {
                setSelectedAuth('acg');
            }
        }
    }, [isOpen, currentStatus, defaultEnv, resumeAuthStep]);

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
    }, [isOpen, resumeAuthStep, selectedAuth, accountStatus?.isConnected, accountStatus?.isConsentGranted]);

    const normalizeStatus = (statusJson) => ({
        ...statusJson,
        connectedUser: statusJson.connectedUser || statusJson.ConnectedUser || {},
        isConsentGranted:
            typeof statusJson.isConsentGranted === 'boolean' ? statusJson.isConsentGranted : statusJson.IsConsentGranted,
        isConnected: typeof statusJson.isConnected === 'boolean' ? statusJson.isConnected : statusJson.IsConnected,
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
            fullName: normalizedSettings.userProfile?.fullName || normalizedSettings.userProfile?.FullName || '',
            email: normalizedSettings.userProfile?.email || normalizedSettings.userProfile?.Email || '',
            countryCode:
                normalizedSettings.userProfile?.countryCode || normalizedSettings.userProfile?.CountryCode || '',
            phoneNumber:
                normalizedSettings.userProfile?.phoneNumber || normalizedSettings.userProfile?.PhoneNumber || '',
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

            // If no redirect was returned, refresh status/settings so the next login attempt can proceed.
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
            const response = await fetch(`${apiBase}/api/accounts?${query.toString()}`, { credentials: 'include' });
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

    const fetchDefaultAccountDetails = async (basePath, userId) => {
        const query = new URLSearchParams({ basePath, userId });
        const response = await fetch(`${apiBase}/api/accounts?${query.toString()}`, { credentials: 'include' });
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || 'Unable to load accounts.');
        }
        const payload = await response.json();
        if (!Array.isArray(payload) || payload.length === 0) {
            throw new Error('No accounts available for this user.');
        }
        const defaultAccount =
            payload.find((acct) => acct.isDefault || acct.IsDefault) ?? payload[0];
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
            throw new Error(message || 'Unable to connect account.');
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
                latestSettings?.basePath ||
                latestSettings?.BasePath ||
                acgForm.basePath ||
                environment ||
                defaultEnv;
            const userId = latestSettings?.userId || latestSettings?.UserId || acgForm.userId;

            if (!basePath || !userId) {
                throw new Error('Consent information is incomplete. Please grant consent again.');
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

    useEffect(() => {
        if (isOpen && modalStage === 'step' && selectedAuth === 'acg' && accountStatus?.isConsentGranted) {
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
                        <h2>
                            Log in with Docusign
                        </h2>
                    </div>
                    <button className="auth-modal__close" type="button" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <p>Select which authentication option you want to use.</p>
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
                            <span className="auth-option__title">Connect your DocuSign Account</span>
                            <span className="auth-option__description">
                                Agreement Cloud Gateway (user account) authorization.
                            </span>
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
                            <span className="auth-option__title">Log in with a test account</span>
                            <span className="auth-option__description">
                                JWT / test account sign-in from the previous client.
                            </span>
                        </div>
                    </label>
                </div>
                <div className="auth-step__actions">
                    <button className="secondary-btn" type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="primary-btn"
                        type="button"
                        onClick={goToSelectedAuthStep}
                        disabled={!selectedAuth || isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>
                </div>
                {error && <div className="auth-error">{error}</div>}
            </div>
        </div>
    );
}

export default LoginModal;
