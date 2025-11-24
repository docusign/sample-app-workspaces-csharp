import { useEffect, useState } from 'react';
import './App.css';
import LoginModal from './loginModal/LoginModal';

const ENVIRONMENTS = [
  { key: 'demo', label: 'Demo', url: 'https://account-d.docusign.com' },
  { key: 'production', label: 'Production', url: 'https://account.docusign.com' },
];
const API_BASE = 'https://localhost:5001';

function App() {
  const [accountStatus, setAccountStatus] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
          typeof statusJson.isConnected === 'boolean' ? statusJson.isConnected : statusJson.IsConnected,
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
      <header className="home">
        <div className="home__overlay" />
        <div className="nav">
            <div className="nav__brand">
              <img className="nav__logo" src="/signsphere-logo.png" alt="Signsphere" />
            </div>
            <nav className="nav__links">
              <button className="nav__link" type="button">
                Workspaces API <span className="nav__arrow">›</span>
              </button>
              <button className="nav__link" type="button">
                Github Source <span className="nav__arrow">›</span>
              </button>
            </nav>
            <div className="nav__actions">
              {accountStatus?.isConnected ? (
                <button className="pill pill--light nav__cta" type="button" onClick={logout}>
                  Log out
                </button>
              ) : (
                <button className="pill pill--light nav__cta" type="button" onClick={openLoginModal}>
                  Login
                </button>
              )}
            </div>
          </div>
        <div className="home__content">

          <div className="home__grid">
            <div className="home__elipse"></div>
            <div className="home__copy">
              <h1 className="home_title">Welcome to the Workspaces Sample App</h1>
              <p className="home__subtext">
                Explore how organizations use Workspaces to manage, share, and approve critical documents across teams
                and clients
              </p>
            </div>

            <div className="cards">
              {[
                {
                  icon: '/wm_card_icon.png',
                  title: 'Wealth Management client engagement',
                  cta: 'Get started',
                  features: ['Remote signing', 'Templates', 'Branding integration'],
                },
                {
                  icon: '/cp_card_icon.png',
                  title: 'Care Plans approval inbox',
                  cta: 'Get started',
                  features: ['Persistent Workspaces', 'Document aggregation', 'Sign & assign flow'],
                },
              ].map((card) => (
                <div className="card" key={card.title}>
                  <div className="card__icon">
                    <img src={card.icon} alt="" />
                  </div>
                  <div className="card__title">{card.title}</div>
                  <button className="pill card__cta" type="button" onClick={openLoginModal}>
                    {card.cta} →
                  </button>
                  <div className="card__features">
                    <span className="card__features-title">DocuSign features:</span>
                    <ul>
                      {card.features.map((f) => (
                        <li key={f}>✓ {f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <footer className="footer">
        <div className="footer__main">
          <div className="footer__content">
            <h2 className="footer__title">DocuSign: It’s time to agree better</h2>
            <div className="footer__description">
              <p className="footer__text">
                DocuSign helps organizations connect and automate how they prepare, sign, act on, and manage agreements.
              </p>
              <div className="footer__actions">
                <button className="pill footer__cta" type="button" onClick={openLoginModal}>
                  Create developer account
                </button>
                <button className="pill footer__link" type="button">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="footer__copyright">
          <span className="footer__copyright-text">© 2025 DocuSign Inc.</span>
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

export default App;
