import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowRightIcon } from '../assets/icons/arrow-right.svg';
import { ReactComponent as CheckHomeIcon } from '../assets/icons/check_home.svg';

export default function HomePage() {
  const { t } = useTranslation();
  const { openLoginModal, accountStatus } = useOutletContext();
  const navigate = useNavigate();
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState(null);

  useEffect(() => {
    document.body.classList.add('home-page');
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  useEffect(() => {
    if (accountStatus?.isConnected && pendingNavigationUrl) {
      navigate(pendingNavigationUrl);
      setPendingNavigationUrl(null);
    }
  }, [accountStatus?.isConnected, pendingNavigationUrl, navigate]);

  return (
    <>
      <div className="home-hero__content">
        <div className="home-hero__grid">
          {/* <div className="home-hero__elipse"></div> */}
          <div className="home-hero__copy">
            <h1 className="home_title">{t('Welcome')}</h1>
            <p className="home-hero__subtext">{t('Explore')}</p>
          </div>

          <div className="cards">
            {[
              {
                icon: '/wm_card_icon.png',
                title: t('WealthManagement'),
                cta: t('GetStarted'),
                url: '/use-case1',
                features: [t('RemoteSigning'), t('Templates'), t('BrandingIntegration')],
              },
              {
                icon: '/cp_card_icon.png',
                title: t('CarePlans'),
                cta: t('GetStarted'),
                url: '/use-case2',
                features: [t('PersistentWorkspaces'), t('DocumentAggregation'), t('SignAndAssign')],
              },
            ].map((card) => (
              <div className="card_home" key={card.title}>
                <div className="card__icon">
                  <img src={card.icon} alt="" />
                </div>
                <div className="card__title">{card.title}</div>
                <button
                  className="pill card__cta"
                  type="button"
                  onClick={() => {
                    if (accountStatus?.isConnected) {
                      navigate(card.url);
                    } else {
                      setPendingNavigationUrl(card.url);
                      openLoginModal();
                    }
                  }}
                >
                  {card.cta}
                  <ArrowRightIcon className="arrow_right_icon" />
                </button>
                <div className="card__features">
                  <span className="card__features-title">{t('DocuSignFeatures')}</span>
                  <ul>
                    {card.features.map((f) => (
                      <li key={f} className="feature_text">
                        <CheckHomeIcon style={{ marginRight: 12 }} /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer__main">
        <div className="footer__content">
          <h3 className="footer__title">{t('AgreeBetter')}</h3>
          <div className="footer__description">
            <p className="footer__text">{t('AgreeBetterDescription')}</p>
            <div className="footer__actions">
              <button
                className="pill footer__cta"
                type="button"
                onClick={() => window.open('https://go.docusign.com/o/sandbox/', '_blank')}
              >
                {t('CreateDeveloperAccount')}
              </button>
              <button
                className="pill footer__link"
                type="button"
                onClick={() => window.open('https://developers.docusign.com/', '_blank')}
              >
                {t('LearnMore')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
