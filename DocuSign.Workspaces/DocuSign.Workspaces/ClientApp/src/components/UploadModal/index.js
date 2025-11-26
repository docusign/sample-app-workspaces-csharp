import { useEffect, useMemo, useRef, useState } from 'react';
import './UploadModal.scss';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload.svg';

function UploadModal({
  isOpen,
  //   apiBase,
  //   environments,
  //   currentStatus,
  //   onStatusChange,
  onClose,
  //   resumeAuthStep,
  //   onClearAuthStep,
}) {
  const [selectedAuth, setSelectedAuth] = useState('acg'); // acg | jwt
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onFileSelect = (event) => {
    console.log('<<<< UPLOAD FILE');
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal__backdrop" role="dialog" aria-modal="true">
      <div className="upload-modal">
        <button className="upload-modal__close" type="button" onClick={onClose} aria-label="Close">
          <img src="/close_modal.png" alt="Close modal" />
        </button>
        <div className="upload-modal__header">
          <div>
            <p className="upload-modal__description">Upload care plan or other document</p>
          </div>
        </div>
        <div
          className="upload-container"
          //   style={{
          //     width: '200px',
          //     height: '150px',
          //     borderRadius: '12px',
          //     padding: '20px',
          //     position: 'relative',
          //     background: 'white',
          //   }}
        >
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <rect
              x="0.5"
              y="0.5"
              width="calc(100% - 1px)"
              height="calc(100% - 1px)"
              rx="12"
              fill="none"
              stroke="#9e9d9f"
              strokeWidth="1"
              strokeDasharray="30 25"
            />
          </svg>
          <div className="upload-icon-container">
            <UploadIcon />
            {/* <div className="upload-icon"></div> */}
          </div>

          <div className="upload-text-container">
            <div className="upload-title">Upload Documents</div>
            <div className="upload-desc">Accepted formats: PDF, DOCX. Max file size: 50MB</div>
          </div>

          <label className="upload-button">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              //   onChange={handleFileInput}
              className="hidden"
            />
            Choose File
            <input type="file" onChange={onFileSelect} className="upload-input-hidden" />
          </label>
        </div>
        {/* <div className="upload-container">
        
        </div> */}
        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}

export default UploadModal;
