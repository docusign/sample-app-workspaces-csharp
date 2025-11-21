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
      <div className="form-holder bg-white pt-5 pb-5">
        <h2 className="mb-4">{t('FormTitle')}</h2>

        <form
          onSubmit={(event) => {
            onSave(event);
            setSubmitted(true);
          }}
          className={submitted ? 'was-validated' : ''}
          noValidate
        >
          {errors.onSave && <div className="alert alert-danger mt-2">{errors.onSave}</div>}
          <h4 className="mb-4">{t('PrimaryTitle')}</h4>
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
          <h4 className="mb-4">{t('SecondaryTitle')}</h4>

          <div className="form-grid">
            <InputText
              name="firstNameSecond"
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
              name="lastNameSecond"
              label=""
              placeholder={t('LastName')}
              value={request.lastName}
              onChange={onChange}
              error={errors.lastName}
            />
            <InputText
              name="emailSecond"
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
              // type="button"
              type="submit"
              disabled={requesting}
              //  onClick={openLoginModal}
            >
              {t('SubmitButton')}
              <ArrowRightIcon className="arrow_right_icon" />
            </button>
            {/* <button
              type="submit"
              disabled={requesting}
              className="btn btn-danger"
            >
              {requesting ? t("SubmitButtonClicked") : t("SubmitButton")}
            </button> */}
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
