import { useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowRightIcon } from '../assets/icons/arrow-right.svg';

export default function HomePage() {
  const { t } = useTranslation();
  const { openLoginModal } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('home-page');
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  return (
    <>
      <div className="home-hero__content">
        <div className="home-hero__grid">
          <div className="home-hero__elipse"></div>
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
                    navigate(card.url);
                  }}
                >
                  {card.cta}
                  <ArrowRightIcon className="arrow_right_icon" />
                </button>
                <div className="card__features">
                  <span className="card__features-title">{t('DocuSignFeatures')}</span>
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
      <div className="footer__main">
        <div className="footer__content">
          <h2 className="footer__title">{t('AgreeBetter')}</h2>
          <div className="footer__description">
            <p className="footer__text">{t('AgreeBetterDescription')}</p>
            <div className="footer__actions">
              <button className="pill footer__cta" type="button" onClick={openLoginModal}>
                {t('CreateDeveloperAccount')}
              </button>
              <button className="pill footer__link" type="button">
                {t('LearnMore')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
