import toast from 'react-hot-toast';
import './CustomToaster.scss';
import { ReactComponent as InfoIcon } from '../assets/icons/info_icon.svg';

export const showToast = (message, type = 'success') => {
  toast.custom(
    (t) => (
      <div className="custom-toast-container">
        <div className="custom-toast-icon-wrapper">
          <InfoIcon />
        </div>
        <span className="custom-toast-message">{message}</span>
        <button onClick={() => toast.dismiss(t.id)} className="custom-toast-close-button">
          ✕
        </button>
      </div>
    ),
    { duration: 50000 }
  );
};
