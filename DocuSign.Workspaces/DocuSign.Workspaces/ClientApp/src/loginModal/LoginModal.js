import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import parse from 'html-react-parser';
import { useAcgLogin } from '../hooks/useAcgLogin';
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

    const { loginWithAcg, isLoading: isAcgLoading, error, setError } = useAcgLogin(apiBase, defaultEnv);

    const [selectedAuth, setSelectedAuth] = useState('jwt'); // acg | jwt
    const [isJwtLoading, setIsJwtLoading] = useState(false);
    const [accountStatus, setAccountStatus] = useState(currentStatus);
    
    const isLoading = selectedAuth === 'acg' ? isAcgLoading : isJwtLoading;

    const autoConnectTriggered = useRef(false);
    const latestLoginWithAcg = useRef(null);

    useEffect(() => {
        setIsTestAccount(selectedAuth === 'jwt');
    }, [selectedAuth, setIsTestAccount]);

    useEffect(() => {
        if (isOpen) {
            setError('');
            setAccountStatus(currentStatus);

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

    const normalizeStatus = useCallback(
        (statusJson) => ({
            ...statusJson,
            connectedUser: statusJson.connectedUser || statusJson.ConnectedUser || {},
            isConsentGranted:
                typeof statusJson.isConsentGranted === 'boolean'
                    ? statusJson.isConsentGranted
                    : statusJson.IsConsentGranted,
            isConnected:
                typeof statusJson.isConnected === 'boolean'
                    ? statusJson.isConnected
                    : statusJson.IsConnected,
        }),
        []
    );

    const fetchStatusAndSettings = useCallback(async () => {
        const statusRes = await fetch(`${apiBase}/api/account/status`, { credentials: 'include' });

        if (!statusRes.ok) {
            const message = await statusRes.text();
            throw new Error(message || t('LoginModal.Error.UnableToLoadAccountStatus'));
        }

        const statusJson = await statusRes.json();
        const normalizedStatus = normalizeStatus(statusJson);

        setAccountStatus(normalizedStatus);
        onStatusChange(normalizedStatus);

        return normalizedStatus;
    }, [apiBase, t, normalizeStatus, onStatusChange]);

    const connectTestAccount = async () => {
        setIsJwtLoading(true);
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

            const contentType = response.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {

                let payload = null;

                payload = await response.json();

                if (payload?.redirectUrl) {
                    window.location.href = payload.redirectUrl;
                    return;
                }
            }

            await fetchStatusAndSettings();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsJwtLoading(false);
        }
    };

    const handleLoginWithAcg = useCallback(async () => {
        try {
            await loginWithAcg(async () => {
                await fetchStatusAndSettings();
                onClearAuthStep?.();
                onClose();
            });
        } catch (err) {
            // Error already set by the hook
        }
    }, [loginWithAcg, fetchStatusAndSettings, onClearAuthStep, onClose]);

    useEffect(() => {
        latestLoginWithAcg.current = handleLoginWithAcg;
    }, [handleLoginWithAcg]);

    const goToSelectedAuthStep = () => {
        if (!selectedAuth) return;
        if (selectedAuth === 'jwt') {
            connectTestAccount();
        } else {
            handleLoginWithAcg();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal__backdrop" role="dialog" aria-modal="true">
            <div className="auth-modal">
                <div className="auth-modal__header">
                    <div>
                        <h2>{t('LoginModal.Title')}</h2>
                    </div>
                </div>
                <button
                    className="auth-modal__close"
                    type="button"
                    onClick={onClose}
                    aria-label={t('Common.Close')}
                >
                    <img src="/close_modal.png" alt={t('LoginModal.CloseModal')} />
                </button>
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
                    <p className="auth-modal__note">{parse(t('LoginModal.GetFreeAccount'))}</p>
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
