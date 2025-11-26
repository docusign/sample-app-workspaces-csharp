import React, { useState, useEffect } from 'react';
import { InputText } from './InputText';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DoctorRow } from './DoctorRow';
import UploadModal from './UploadModal';
// import { ReactComponent as ArrowRightIcon } from '../assets/icons/arrow-right.svg';
import { ReactComponent as PlusIcon } from '../assets/icons/add.svg';
import { ReactComponent as SmsIcon } from '../assets/icons/sms.svg';

const listToSign = [
  { id: 21, label: 'Dr. Max Payne' },
  { id: 22, label: 'Dr. Angela Kerr' },
  { id: 23, label: 'Dr. Luke Heer' },
];

export const RequestFormPhysician = ({
  request,
  onSave,
  onChange,
  clickwrap,
  requesting = false,
  errors = {},
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [clickApiReady, setClickApiReady] = useState(false);

  const openModal = () => setIsUploadOpen(true);
  const closeModal = () => setIsUploadOpen(false);

  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const [checkedMap, setCheckedMap] = useState(
    Object.fromEntries(listToSign.map((item) => [item.id, false]))
  );

  const toggle = (id) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white pb-5">
        <h3 className="mb-4">Physician information</h3>

        <form
          onSubmit={(event) => {
            onSave(event);
            setSubmitted(true);
          }}
          className={submitted ? 'was-validated' : ''}
          noValidate
        >
          <p className="form-second-title">
            To see the physician’s experience, provide your email address to receive the Workspace
            invitation
          </p>
          <div className="form-grid col-lg-6">
            <InputText
              name="email"
              placeholder={t('Email')}
              label={
                <>
                  <SmsIcon className="form_icon" />
                  {t('Email')}
                </>
              }
              value={request.email}
              onChange={onChange}
              error={errors.email}
            />
          </div>
          <h3 className="mb-4 mt-4">Select physician</h3>
          <div className="form-grid">
            {listToSign.map((item) => (
              <DoctorRow
                key={item.id}
                label={item.label}
                checked={checkedMap[item.id]}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>
          <h3 className="mb-4 mt-4">Upload care plan or other documents</h3>
          <button
            className="btn-upload-document"
            type="button"
            onClick={() => {
              openModal(true);
            }}
          >
            <PlusIcon className="plus" />
            Upload Document
          </button>

          <div className="text-end">
            <button
              className="pill card__cta btn-primary"
              type="submit"
              disabled={
                requesting ||
                !request.firstName ||
                !request.lastName ||
                !request.email ||
                errors.email
              }
            >
              Submit to Physician
            </button>
          </div>
        </form>
      </div>
      <UploadModal
        isOpen={isUploadOpen}
        // apiBase={API_BASE}
        // environments={ENVIRONMENTS}
        // currentStatus={accountStatus}
        // onStatusChange={setAccountStatus}
        onClose={closeModal}
        // onLogout={logout}
        // resumeAuthStep={getCookie('ds_auth_step') === 'acg-consent' ? 'acg' : null}
        // onClearAuthStep={clearAuthCookie}
      />
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
