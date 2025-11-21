import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowLeftIcon } from '../assets/icons/arrow-left.svg';

export default function GoBackArrow() {
  const { t } = useTranslation();

  return (
    <Link to="/" className="back-link">
      <ArrowLeftIcon className="back-link__icon" />
      {t('Back')}
    </Link>
  );
}
