import React, { useState, useEffect } from 'react';
import { InputText } from './InputText';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import './RequestFormPhysician.scss';
import { DoctorRow } from './DoctorRow';
import UploadModal from './UploadModal';
import { ReactComponent as PlusIcon } from '../assets/icons/add.svg';
import { ReactComponent as SmsIcon } from '../assets/icons/sms.svg';
import { ReactComponent as TrashIcon } from '../assets/icons/trash.svg';
import { ReactComponent as PdfType } from '../assets/icons/pdf.svg';
import { ReactComponent as DocType } from '../assets/icons/doc.svg';

const listToSign = [
  { id: 21, name: 'Dr. Max Payne' },
  { id: 22, name: 'Dr. Angela Kerr' },
  { id: 23, name: 'Dr. Luke Heer' },
];
const listFiles = [
  {
    id: 211,
    forSignature: false,
    type: 'pdf',
    name: 'Patient progress report TEST.pdf',
    path: '/Patient progress report TEST.pdf',
    isNeedSign: true,
    isSubmitted: true,
    status: 'success',
  },
  {
    id: 212,
    forSignature: false,
    type: 'pdf',
    name: 'Physical therapy plan TEST.pdf',
    path: '/Physical therapy plan TEST.pdf',
    isNeedSign: true,
    isSubmitted: true,
    status: 'success',
  },
  {
    id: 213,
    forSignature: false,
    type: 'pdf',
    name: 'Specialized home care plan doc TEST.pdf',
    path: '/Specialized home care plan doc TEST.pdf',
    isNeedSign: false,
    isSubmitted: true,
    status: 'success',
  },
];

export const RequestFormPhysician = ({
  request,
  onSave,
  onChange,
  clickwrap,
  requesting = false,
  errors = {},
}) => {
  const { accountStatus } = useOutletContext();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const openModal = () => setIsUploadOpen(true);
  const closeModal = () => setIsUploadOpen(false);
  useEffect(() => {
    console.log('<<<< RequestFormPhysician accountStatus', accountStatus);
    if (!accountStatus?.isConnected) {
      setUploadedFiles(listFiles);
    }
  }, [accountStatus]);

  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const [checkedMap, setCheckedMap] = useState(
    Object.fromEntries(listToSign.map((item) => [item.id, false]))
  );

  const toggle = (id) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f))
      );

      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'success', progress: 100 } : f))
        );
      }
    }, 300);
  };

  const handleFilesChange = (files) => {
    const maxSize = 50 * 1024 * 1024; // 50MB

    const processedFiles = Array.from(files).map((file) => {
      const isOverLimit = file.size > maxSize;

      const fileObj = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: isOverLimit ? 'error' : 'uploading',
        progress: 0,
        forSignature: false,
        errorMessage: isOverLimit ? 'File size exceeds 50 MB limit' : null,
        file: file,
      };

      if (!isOverLimit) {
        setTimeout(() => simulateUpload(fileObj.id), 100);
      }

      return fileObj;
    });
    setUploadedFiles((prev) => {
      const updated = [...prev, ...processedFiles];
      return updated;
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const forSend = (fileId) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, forSend: !f.forSend } : f))
    );
  };
  const toggleSignature = (fileId) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, forSignature: !f.forSignature } : f))
    );
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('document')) return 'doc';
    return 'file';
  };

  const handleSubmit = (event) => {
    const requestWithFiles = {
      ...request,
      files: uploadedFiles.filter((f) =>
        accountStatus?.isConnected
          ? f.forSignature
          : f.forSend && (f.isNeedSign ? f.forSignature : true)
      ),
    };

    onSave(requestWithFiles);
    setSubmitted(true);
  };

  const handlePreview = (file) => {
    if (file && file.file) {
      const fileURL = URL.createObjectURL(file.file);
      window.open(fileURL, '_blank');
    } else if (file && file.path) {
      window.open(file.path, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white pb-5">
        <div className="mb-2 subtitle1">Physician information</div>

        <form onSubmit={handleSubmit} className={submitted ? 'was-validated' : ''} noValidate>
          <div className="subtitle2 mb-4">
            To see the physician's experience, provide your email address to receive the Workspace
            invitation
          </div>
          <div className="form-grid col-lg-8 mb-4">
            <InputText
              name="email"
              placeholder={t('Email')}
              label={
                <div className="label_input">
                  <SmsIcon className="form_icon" />
                  {t('Email')}
                </div>
              }
              value={request.email}
              onChange={onChange}
              error={errors.email}
            />
          </div>

          <div className="subtitle1 mb-4 mt-5 ">Select physician</div>
          <div className=" mb-5 subtitle2">
            {listToSign.map((item) => (
              <DoctorRow
                key={item.id}
                label={item.name}
                checked={checkedMap[item.id]}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>

          <div className="mb-4 mt-4 subtitle1">Incoming documents</div>

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-container mb-3">
              {uploadedFiles.map((file) => (
                <div className="d-flex align-items-center">
                  {!accountStatus?.isConnected && (
                    <label className="uploaded-file-signature me-3">
                      <input
                        type="checkbox"
                        checked={file.forSend}
                        onChange={() => forSend(file.id)}
                      />
                    </label>
                  )}
                  <div key={file.id} className="uploaded-file-item">
                    <div className="uploaded-file-icon">
                      {getFileIcon(file.type) === 'pdf' ? <PdfType /> : <DocType />}
                    </div>

                    <div className="uploaded-file-content">
                      <div className="uploaded-file-header">
                        <span className="uploaded-file-name">{file.name}</span>

                        <button
                          type="button"
                          className="uploaded-file-preview"
                          onClick={() => handlePreview(file)}
                        >
                          Preview
                        </button>
                      </div>

                      {file.status === 'uploading' && (
                        <div className="uploaded-file-progress">
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {file.status === 'error' && (
                        <div className="uploaded-file-error">
                          <div className="warning_file">!</div>
                          <span>{file.errorMessage}</span>
                        </div>
                      )}

                      {file.isNeedSign && (
                        <label className="uploaded-file-signature">
                          <input
                            type="checkbox"
                            checked={file.forSignature}
                            onChange={() => toggleSignature(file.id)}
                          />
                          <span>For signature</span>
                        </label>
                      )}
                    </div>

                    {accountStatus?.isConnected &&
                      (file.status === 'uploading' ? (
                        <div className="uploaded-file-progress">
                          <div className="uploaded-file-progress-info">
                            <span>{file.progress}%</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="uploaded-file-remove"
                          onClick={() => removeFile(file.id)}
                          aria-label="Remove file"
                        >
                          <TrashIcon style={file.status === 'error' ? { color: '#CA5048' } : {}} />
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {accountStatus?.isConnected && (
            <button className="btn-upload-document" type="button" onClick={openModal}>
              <PlusIcon className="plus" />
              Upload Document
            </button>
          )}

          <div className="text-end">
            <button
              className="pill card__cta btn-primary"
              type="button"
              onClick={handleSubmit}
              disabled={
                !Object.values(checkedMap).some((item) => item) ||
                !uploadedFiles.some((f) => f.forSignature) ||
                !request.email ||
                errors.email
              }
            >
              Submit to Physician
            </button>
          </div>
        </form>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={closeModal} onFilesChange={handleFilesChange} />
    </div>
  );
};

RequestFormPhysician.propTypes = {
  request: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  requesting: PropTypes.bool,
};
