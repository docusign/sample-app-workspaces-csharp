import { useState, useEffect } from 'react';
import { InputText } from './InputText';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import './RequestFormPhysician.scss';
import { DoctorRow } from './DoctorRow';
import UploadModal from './UploadModal';
import { SkeletonDoctors } from './SkeletonDoctors';
import { ReactComponent as PlusIcon } from '../assets/icons/add.svg';
import { ReactComponent as SmsIcon } from '../assets/icons/sms.svg';
import { ReactComponent as TrashIcon } from '../assets/icons/trash.svg';
import { ReactComponent as PdfType } from '../assets/icons/pdf.svg';
import { ReactComponent as DocType } from '../assets/icons/doc.svg';

const listFiles = [
  {
    id: 212,
    isForSignature: true,
    type: 'pdf',
    name: 'Physical Therapy Plan of CarePatient Information.pdf',
    path: '/Physical Therapy Plan of CarePatient Information.pdf',
    isNeedSign: true,
    status: 'success',
  },
  {
    id: 213,
    isForSignature: true,
    type: 'pdf',
    name: 'Specialized Home Care Plan.pdf',
    path: '/Specialized Home Care Plan.pdf',
    isNeedSign: true,
    status: 'success',
  },
  {
    id: 211,
    isForSignature: false,
    type: 'pdf',
    name: 'Patient Lab Report.pdf',
    path: '/Patient Lab Report.pdf',
    isNeedSign: false,
    status: 'success',
  },
];

export const RequestFormPhysician = ({
  request,
  onSave,
  onChange,
  requesting = false,
  errors = {},
  listPhysician = [],
  isLoadingPhysician,
  selectedPhysician,
  setSelectedPhysician,
}) => {
  const { accountStatus, isTestAccount } = useOutletContext();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const openModal = () => setIsUploadOpen(true);
  const closeModal = () => setIsUploadOpen(false);

  useEffect(() => {
    if (isUploadOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isUploadOpen]);

  useEffect(() => {
    if (accountStatus?.isConnected) {
      if (isTestAccount) {
        setUploadedFiles(listFiles);
      } else {
        setUploadedFiles([]);
      }
    }
  }, [accountStatus, isTestAccount]);

  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const toggle = (item) => {
    setSelectedPhysician(item);
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
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'success', isNeedSign: true, progress: 100 } : f
          )
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
        isForSignature: false,
        errorMessage: isOverLimit ? t('RequestFormPhysician.FileSizeLimitExceeded') : null,
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

  const toggleSignature = (fileId) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isForSignature: !f.isForSignature } : f))
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
      files: uploadedFiles.filter((f) => f.isNeedSign),
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
      <div className="form-holder bg-white">
        <div className="mb-2 subtitle1">{t('RequestFormPhysician.PhysicianInformation')}</div>

        <form onSubmit={handleSubmit} className={submitted ? 'was-validated' : ''} noValidate>
          <div className="subtitle2 mb-4">{t('RequestFormPhysician.InvitationMessage')}</div>
          <div className="form-grid col-lg-8 width_form mb-4">
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

          <div className="subtitle1 mb-4 mt-5 ">{t('RequestFormPhysician.SelectPhysician')}</div>
          <div className=" mb-5 subtitle2">
            {isLoadingPhysician ? (
              <SkeletonDoctors count={3} />
            ) : (
              listPhysician.map((item) => (
                <DoctorRow
                  key={item?.workspaceId}
                  label={item.name}
                  checked={selectedPhysician?.workspaceId === item?.workspaceId}
                  onToggle={() => toggle(item)}
                />
              ))
            )}
          </div>

          <div className="subtitle1 margin_top_bottom_second">
            {t('RequestFormPhysician.IncomingDocuments')}
          </div>
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-container mb-3">
              {uploadedFiles.map((file) => (
                <div className="d-flex align-items-center">
                  <div
                    key={file.id}
                    className={`uploaded-file-item ${file.isNeedSign || isTestAccount ? '' : 'uploaded-file-item--signed'}`}
                  >
                    <div className="uploaded-file-icon">
                      {getFileIcon(file.type) === 'pdf' ? (
                        <PdfType className="doc_icon_size" />
                      ) : (
                        <DocType className="doc_icon_size" />
                      )}
                    </div>

                    <div className="uploaded-file-content">
                      <div className="uploaded-file-header">
                        <span className="uploaded-file-name">{file.name}</span>

                        {file.status !== 'uploading' && (
                          <button
                            type="button"
                            className={`uploaded-file-preview preview-large-screen ${!isTestAccount ? 'mobile_hide' : ''}`}
                            onClick={() => handlePreview(file)}
                          >
                            {t('Common.Preview')}
                          </button>
                        )}
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
                      <div className="review-small-screen">
                        {file.isNeedSign && !isTestAccount && (
                          <label className="uploaded-file-signature">
                            <input
                              type="checkbox"
                              checked={file.isForSignature}
                              onChange={() => toggleSignature(file.id)}
                            />
                            <span>{t('Common.ForSignature')}</span>

                            {file.status !== 'uploading' && (
                              <button
                                type="button"
                                className="uploaded-file-preview preview-large-screen mobile_show"
                                onClick={() => handlePreview(file)}
                              >
                                {t('Common.Preview')}
                              </button>
                            )}
                          </label>
                        )}
                        {isTestAccount &&
                          file.isNeedSign &&
                          (file.isForSignature ? (
                            <label className="is_need_signature">
                              <span>{t('Common.RequiresSignature')}</span>
                            </label>
                          ) : (
                            <label className="is_not_need_signature">
                              <span>{t('Common.DoNotRequireSignature')}</span>
                            </label>
                          ))}
                      </div>
                    </div>

                    {accountStatus?.isConnected &&
                      (file.status === 'uploading' ? (
                        <div className="uploaded-file-progress">
                          <div className="uploaded-file-progress-info">
                            <span>{file.progress}%</span>
                          </div>
                        </div>
                      ) : (
                        !isTestAccount && (
                          <button
                            type="button"
                            className="uploaded-file-remove"
                            onClick={() => removeFile(file.id)}
                            aria-label={t('Common.RemoveFile')}
                          >
                            <TrashIcon
                              style={file.status === 'error' ? { color: '#CA5048' } : {}}
                            />
                          </button>
                        )
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {accountStatus?.isConnected && !isTestAccount && (
            <button className="btn-upload-document" type="button" onClick={openModal}>
              <PlusIcon className="plus_upload" />
              {t('Common.UploadDocument')}
            </button>
          )}

          <div className="text-end">
            <button
              className="pill card__cta btn-primary width_100_small_screen"
              type="button"
              onClick={handleSubmit}
              disabled={
                requesting ||
                !selectedPhysician ||
                !uploadedFiles.some((f) => f.isForSignature) ||
                !request.email ||
                errors.email
              }
            >
              {t('RequestFormPhysician.SubmitToPhysician')}
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
