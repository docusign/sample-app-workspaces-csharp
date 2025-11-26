import { useState, useCallback } from 'react';
import './UploadModal.scss';
import { ReactComponent as UploadIcon } from '../../assets/icons/upload.svg';

function UploadModal({ isOpen, onClose, onFilesChange }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    },
    [setDragActive]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesChange(e.dataTransfer.files);
      }
    },
    [onFilesChange, setDragActive]
  );

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesChange(e.target.files);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal__backdrop" role="dialog" aria-modal="true">
      <div className="upload-modal">
        <button className="upload-modal__close" type="button" onClick={onClose} aria-label="Close">
          <img src="/close_modal.png" alt="Close modal" />
        </button>

        <div className="upload-modal__header">
          <h2>Upload care plan or other document</h2>
        </div>

        {/* Drag and Drop зона */}
        <div
          className={`upload-container ${dragActive ? 'upload-container--active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <svg className="upload-container__border">
            <rect
              x="0.5"
              y="0.5"
              width="calc(100% - 1px)"
              height="calc(100% - 1px)"
              rx="12"
              fill="none"
              stroke={dragActive ? '#6e47cc' : '#9e9d9f'}
              strokeWidth="2"
              strokeDasharray="30 25"
            />
          </svg>

          <div className="upload-icon-container">
            <UploadIcon className="upload_icon" />
          </div>

          <div className="upload-text-container">
            <div className="upload-title">Upload Documents</div>
            <div className="upload-desc">Accepted formats: PDF, DOCX. Max file size: 50MB</div>
          </div>

          <label className="upload-button">
            Choose File
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              className="upload-input-hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
