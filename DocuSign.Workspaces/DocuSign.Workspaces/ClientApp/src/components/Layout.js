import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginModal from '../loginModal/LoginModal';
import { ReactComponent as ChevronRightIcon } from '../assets/icons/chevron-right.svg';

const ENVIRONMENTS = [
  { key: 'demo', label: 'Demo', url: 'https://account-d.docusign.com' },
  { key: 'production', label: 'Production', url: 'https://account.docusign.com' },
];
const API_BASE = 'https://localhost:5001';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const [accountStatus, setAccountStatus] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const clearAuthCookie = () => {
    document.cookie = 'ds_auth_step=; Max-Age=0; path=/';
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/account/status`, { credentials: 'include' });
      if (!res.ok) return;
      const statusJson = await res.json();
      setAccountStatus({
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
      });
    } catch {
      // ignore initial load errors
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    const authStep = getCookie('ds_auth_step');
    if (authStep === 'acg-consent' && accountStatus?.isConsentGranted) {
      setIsLoginOpen(true);
    }
  }, [accountStatus]);

  const openLoginModal = () => setIsLoginOpen(true);
  const closeLoginModal = () => setIsLoginOpen(false);

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/account/logout`, { credentials: 'include' });
    } catch {
    } finally {
      setAccountStatus(null);
      clearAuthCookie();
      closeLoginModal();
    }
  };

  return (
    <div className="home">
      <header className="home-hero">
        <div
          className={`nav__overlay ${isNavOpen ? 'nav__overlay--open' : ''}`}
          onClick={() => setIsNavOpen(false)}
        />
        <div className={`nav ${isNavOpen ? 'nav--open' : ''}`}>
          <div className="nav__brand">
            <Link to="/">
              <img className="nav__logo" src="/signsphere-logo.png" alt="Signsphere" />
            </Link>
          </div>
          <button className="nav__toggle" type="button" onClick={() => setIsNavOpen(!isNavOpen)}>
            <span />
            <span />
            <span />
          </button>
          <nav className={`nav__links ${isNavOpen ? 'nav__links--open' : ''}`}>
            <Link to="/workspaces" className="nav__link">
              {t('WorkspacesAPI')}{' '}
              <span className="nav__arrow">
                <ChevronRightIcon />
              </span>
            </Link>
            <a
              className="nav__link"
              href="https://github.com/docusign/code-examples-csharp/tree/master/Workspaces"
              target="_blank"
              rel="noreferrer"
            >
              {t('GithubSource')}{' '}
              <span className="nav__arrow">
                <ChevronRightIcon />
              </span>
            </a>
            <div className="nav__actions">
              {accountStatus?.isConnected ? (
                <button className="pill pill--light nav__cta" type="button" onClick={logout}>
                  {t('Logout')}
                </button>
              ) : (
                <button
                  className="pill pill--light nav__cta"
                  type="button"
                  onClick={openLoginModal}
                >
                  {t('Login')}
                </button>
              )}
            </div>
            <div className="language_toggle">
              <button onClick={() => changeLanguage('en')}>EN</button>
              <button onClick={() => changeLanguage('uk')}>UK</button>
            </div>
          </nav>
        </div>
        <Outlet context={{ openLoginModal }} />
      </header>

      <footer className="footer">
        <div className="footer__copyright">
          <span className="footer__copyright-text">{t('Copyright')}</span>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginOpen}
        apiBase={API_BASE}
        environments={ENVIRONMENTS}
        currentStatus={accountStatus}
        onStatusChange={setAccountStatus}
        onClose={closeLoginModal}
        onLogout={logout}
        resumeAuthStep={getCookie('ds_auth_step') === 'acg-consent' ? 'acg' : null}
        onClearAuthStep={clearAuthCookie}
      />
    </div>
  );
}
