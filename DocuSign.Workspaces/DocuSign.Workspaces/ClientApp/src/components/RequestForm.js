import React, { useState } from 'react';
import { InputText } from './InputText';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowRightIcon } from '../assets/icons/arrow-right.svg';
import { ReactComponent as UserIcon } from '../assets/icons/user.svg';
import { ReactComponent as SmsIcon } from '../assets/icons/sms.svg';

export const RequestForm = ({
  request,
  onSave,
  onChange,
  clickwrap,
  requesting = false,
  errors = {},
}) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white pb-5">
        <h4 className="mb-5">{t('FormTitle')}</h4>

        <form
          onSubmit={(event) => {
            onSave(event);
            setSubmitted(true);
          }}
          className={submitted ? 'was-validated' : ''}
          noValidate
        >
          <div className="subtitle1 mb-4">{t('PrimaryTitle')}</div>
          <div className="form-grid  mb-5">
            <InputText
              name="firstName"
              label={
                <>
                  <UserIcon className="form_icon" />
                  {t('FullName')}
                </>
              }
              placeholder={t('FirstName')}
              value={request.firstName}
              onChange={onChange}
              error={errors.firstName}
            />
            <InputText
              name="lastName"
              label=""
              placeholder={t('LastName')}
              value={request.lastName}
              onChange={onChange}
              error={errors.lastName}
            />
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
          <div className="subtitle1  mb-4">
            {t('SecondaryTitle')}
            <span className="optional-italic">{t('Common.Optional')}</span>
          </div>

          <div className="form-grid">
            <InputText
              name="firstNameOptional"
              label={
                <>
                  <UserIcon className="form_icon" />
                  {t('FullName')}
                </>
              }
              placeholder={t('FirstName')}
              value={request.firstNameOptional}
              onChange={onChange}
              error={errors.firstNameOptional}
              required={false}
            />
            <InputText
              name="lastNameOptional"
              label=""
              placeholder={t('LastName')}
              value={request.lastNameOptional}
              onChange={onChange}
              error={errors.lastNameOptional}
              required={false}
            />
            <InputText
              name="emailOptional"
              placeholder={t('Email')}
              label={
                <>
                  <SmsIcon className="form_icon" />
                  {t('Email')}
                </>
              }
              value={request.emailOptional}
              onChange={onChange}
              error={errors.emailOptional}
              required={false}
            />
          </div>
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
              {t('SubmitButton')}
              <ArrowRightIcon className="arrow_right_icon" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
RequestForm.propTypes = {
  request: PropTypes.object.isRequired,
  errors: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  requesting: PropTypes.bool,
};
