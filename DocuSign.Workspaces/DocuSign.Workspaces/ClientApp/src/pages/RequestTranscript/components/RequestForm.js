import React, { useState, useEffect } from 'react';
import { InputText } from '../../../components/InputText';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ClickWrap } from './Clickwrap';
import { LoadClickwrapApi } from './LoadClickwrapApi';
import { ReactComponent as ArrowRightIcon } from '../../../assets/icons/arrow-right.svg';
import { ReactComponent as UserIcon } from '../../../assets/icons/user.svg';
import { ReactComponent as SmsIcon } from '../../../assets/icons/sms.svg';

export const RequestForm = ({
  request,
  onSave,
  onChange,
  clickwrap,
  requesting = false,
  errors = {},
}) => {
  const [clickApiReady, setClickApiReady] = useState(false);
  useEffect(() => {
    LoadClickwrapApi(() => {
      setClickApiReady(true);
    });
  }, []);
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="col-lg-8">
      <div className="form-holder bg-white pb-5">
        <h2 className="mb-4">{t('FormTitle')}</h2>

        <form
          onSubmit={(event) => {
            onSave(event);
            setSubmitted(true);
          }}
          className={submitted ? 'was-validated' : ''}
          noValidate
        >
          <p className="form-second-title">{t('PrimaryTitle')}</p>
          <div className="form-grid">
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
          <p className="form-second-title">
            {t('SecondaryTitle')}
            <span className="optional-italic"> (optional)</span>
          </p>

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
          <div id="ds-clickwrap"></div>
          {clickwrap && clickApiReady && request.email ? (
            <ClickWrap
              accountId={clickwrap.accountId}
              clickwrapId={clickwrap.clickwrapId}
              clientUserId={request.email}
            />
          ) : null}
          <div id="ds-clickwrap-preview"></div>

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
