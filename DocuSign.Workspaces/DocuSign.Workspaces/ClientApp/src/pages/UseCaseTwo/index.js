import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RequestFormPhysician } from '../../components/RequestFormPhysician';
import GoBackArrow from '../../components/GoBackArrow';
import { ApiDescription } from '../../components/ApiDescription';
import { TableDocuments } from '../../components/TableDocuments';
import { SomethingWentWrong } from '../../components/SomethingWentWrong';

const initialState = {
  errors: [],
  request: {
    email: '',
    files: [],
  },
};

export const UseCaseTwoPage = () => {
  const { t } = useTranslation();
  const [request, setRequestData] = useState({ ...initialState.request });
  const [requesting, setRequesting] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorOnboarding, setErrorOnboarding] = useState('');
  // const { accountStatus } = useOutletContext();
  //TODO: SET 0
  const [currentStep, setCurrentStep] = useState(0);

  async function handleSave(event) {
    if (!formIsValid()) {
      return;
    }

    setRequesting(true);
    try {
      setRequestData(event);

      setCurrentStep(1);
    } catch (error) {
      setRequesting(false);
    }
  }

  function handleChange(event) {
    const { name } = event.target;
    const { [name]: removed, ...updatedErrors } = errors;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setErrors(updatedErrors);
    setRequestData((request) => ({
      ...request,
      [name]: value,
    }));
  }

  function formIsValid() {
    const { email } = request;
    const errors = {};

    if (
      !email ||
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email
      )
    ) {
      errors.email = t('Error.Email');
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  }

  return (
    <section className="content-section">
      <GoBackArrow />
      <h2>{t('UseCaseTwo.Title')}</h2>
      <div className="col-lg-6 body1">
        {t('UseCaseTwo.Description')}
      </div>
      <div className="form_and_description_grid">
        {currentStep === 0 && (
          <RequestFormPhysician
            request={request}
            requesting={requesting}
            onChange={handleChange}
            onSave={handleSave}
            errors={errors}
          />
        )}

        {currentStep === 1 &&
          (errorOnboarding ? (
            <SomethingWentWrong
              tryAgain={() => {
                setCurrentStep(0);
              }}
            />
          ) : (
            <TableDocuments listFiles={request.files} />
          ))}
        <ApiDescription />
      </div>
    </section>
  );
};
