import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'react-hot-toast';
import { RequestForm } from '../../components/RequestForm';
import GoBackArrow from '../../components/GoBackArrow';
import { ApiDescription } from '../../components/ApiDescription';
import StepProgress from '../../components/StepProgress';
import { SelectDocuments } from '../../components/SelectDocuments';
import { Onboarding } from '../../components/Onboarding';
import { SomethingWentWrong } from '../../components/SomethingWentWrong';
import { API_BASE } from '../../components/Layout';
import { showToast } from '../../components/CustomToaster';
import { prepareDocuments } from '../../components/helper/filesConverter';

const urlCreate = `${API_BASE}/api/workspaces/create`;
const urlAddDocuments = `${API_BASE}/api/workspaces/add-selected-documents`;

const initialState = {
  errors: [],
  request: {
    firstName: '',
    lastName: '',
    email: '',
    firstNameOptional: '',
    lastNameOptional: '',
    emailOptional: '',
  },
};

export const UseCaseOnePage = () => {
  const { t } = useTranslation();
  const [request, setRequestData] = useState({ ...initialState.request });
  const [workspaceId, setWorkspaceId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorOnboarding, setErrorOnboarding] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [respFiles, setRespFiles] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 420);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 420);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    if (!formIsValid()) {
      return;
    }
    setRequesting(true);
    try {
      const payload = {
        workspacesName: request.firstName + request.lastName,
      };
      const res = await fetch(urlCreate, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error(`${t('Common.ServerError')}${res.status}`);
        throw new Error(`${t('Common.ServerError')}${res.status}`);
      }
      const workspaceId = await res.text();

      setWorkspaceId(workspaceId);
      showToast(t('UseCaseOne.WorkspaceCreatedSuccess'));
      setCurrentStep(1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRequesting(false);
    }
  }

  async function onAddDocuments(event) {
    setRequesting(true);
    const documents = await prepareDocuments(event);
    try {
      const payload = {
        workspaceId: workspaceId,
        documents,
        primaryOwnerFirstName: request.firstName,
        primaryOwnerLastName: request.lastName,
        primaryOwnerEmail: request.email,
        secondaryOwnerFirstName: request.firstNameOptional,
        secondaryOwnerLastName: request.lastNameOptional,
        secondaryOwnerEmail: request.emailOptional,
      };
      const res = await fetch(urlAddDocuments, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`${t('Common.ServerError')}${res.status}`);
      }

      const data = await res.json();
      setRespFiles(data);
      showToast(t('UseCaseOne.EnvelopeSuccessfullyCreated'));
    } catch (error) {
      setErrorOnboarding(t('Common.Error'));
    } finally {
      setRequesting(false);
      setCurrentStep(2);
    }
  }

  const onPrevious = () => {
    if (currentStep >= 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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
    const { email, emailOptional } = request;
    const errors = {};

    if (
      !email ||
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email
      )
    ) {
      errors.email = t('Error.Email');
    }
    if (
      emailOptional &&
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        emailOptional
      )
    ) {
      errors.emailOptional = t('Error.Email');
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  }

  return (
    <section className="content-section">
      <GoBackArrow />
      <h2>{t('UseCaseOne.Title')}</h2>
      <div className="col-lg-11">
        <StepProgress
          steps={[t('UseCaseOne.Step1'), t('UseCaseOne.Step2'), t('UseCaseOne.Step3')]}
          currentStep={currentStep}
        />
      </div>
      <div className="form_and_description_grid">
        {currentStep === 0 && (
          <RequestForm
            request={request}
            requesting={requesting}
            onChange={handleChange}
            onSave={handleSave}
            errors={errors}
          />
        )}
        {currentStep === 1 && (
          <SelectDocuments
            onPrevious={onPrevious}
            requesting={requesting}
            onAddDocuments={onAddDocuments}
          />
        )}

        {currentStep === 2 &&
          (errorOnboarding ? (
            <SomethingWentWrong
              tryAgain={() => {
                setCurrentStep(0);
              }}
            />
          ) : (
            <Onboarding filesList={respFiles} />
          ))}
        <ApiDescription />
      </div>
      <Toaster
        position={isMobile ? 'top-right' : 'top-center'}
        containerStyle={isMobile ? { top: 95, right: 8 } : {}}
      />
    </section>
  );
};
