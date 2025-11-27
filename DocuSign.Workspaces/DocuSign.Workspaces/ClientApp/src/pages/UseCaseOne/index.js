import React, { useState, useReducer, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'react-hot-toast';
import { RequestForm } from '../../components/RequestForm';
import GoBackArrow from '../../components/GoBackArrow';
import { ApiDescription } from '../../components/ApiDescription';
import StepProgress from '../../components/StepProgress';
import { reducer } from './requestReducer';
import * as studentsAPI from '../../api/studentsAPI';
import * as Actions from './actionTypes';
import { download } from '../../api/download';
import { SelectDocuments } from '../../components/SelectDocuments';
import { Onboarding } from '../../components/Onboarding';
import { SomethingWentWrong } from '../../components/SomethingWentWrong';
import { API_BASE } from '../../components/Layout';
import { showToast } from '../../components/CustomToaster';

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
  clickwrap: null,
};

export const UseCaseOnePage = () => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [request, setRequestData] = useState({ ...initialState.request });
  const [workspaceId, setWorkspaceId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorOnboarding, setErrorOnboarding] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [respFiles, setRespFiles] = useState([]);

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
        console.log('<<<< res', res);
        toast.error(`Server error: ${res.status}`);
        throw new Error(`Server error: ${res.status}`);
      }
      const workspaceId = await res.text();

      setWorkspaceId(workspaceId);
      showToast('Workspace successfully created');
      setCurrentStep(1);
    } catch (error) {
      setRequesting(false);
      toast.error(error.message);
    }
  }
  async function fetchPublicFileAsBase64(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Cannot load file: ${path}`);

    const blob = await res.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const dataUrl = reader.result;
        const base64String = dataUrl.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function prepareDocuments(list) {
    const docs = [];

    for (const item of list) {
      const base64 = await fetchPublicFileAsBase64(item.path);
      docs.push({
        base64String: base64,
        name: item.label,
      });
    }

    return docs;
  }

  async function onAddDocuments(event) {
    if (!formIsValid()) {
      return;
    }
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
      console.log('<<<< 22 payload', payload);
      const res = await fetch(urlAddDocuments, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log('<<<< 22 res', res);
      if (!res.ok) {
        toast.error(`Server error: ${res.status}`);
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log('<< 22 RESPONSE create data', data);
      setRespFiles(data);
      // showToast('Workspace successfully created');
      setCurrentStep(2);
    } catch (error) {
      console.log('<< 22 ERROR', error);
      setRequesting(false);
      toast.error(error.message);
      // //TODO: REMOVE setCurrentStep!!!
      // setCurrentStep(1);
    }
  }

  async function getTranscript(event, clickwrap) {
    if (event.data.type === 'HAS_AGREED') {
      const body = {
        clickwrap_id: clickwrap.clickwrapId,
        client_user_id: request.email,
        student: {
          first_name: request.firstName,
          last_name: request.lastName,
        },
      };
      try {
        const response = await studentsAPI.requestTranscript(body);
        download(response, 'transcript', 'html', 'text/html');

        window.addEventListener(
          'message',
          (event) => {
            if (event.data.type === 'DOWNLOADED') {
              setTimeout(() => {
                goToSigningComplete(event);
              }, 10000);
            } else {
              goToSigningComplete(event);
            }
          },
          false
        );
      } catch (error) {
        throw error;
      }
    }
  }

  const onPrevious = () => {
    if (currentStep >= 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  function goToSigningComplete(event) {
    window.top.location.href = process.env.REACT_APP_DS_RETURN_URL + '/signing_complete';
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
    const { firstName, lastName, email, emailOptional } = request;
    const errors = {};
    if (!firstName) {
      errors.firstName = t('Error.FirstName');
    }
    if (!lastName) {
      errors.lastName = t('Error.LastName');
    }

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
      <h2>Onboarding a new wealth management client </h2>
      <div className="col-lg-11">
        <StepProgress steps={['STEP 1', 'STEP 2', 'STEP 3']} currentStep={currentStep} />
      </div>
      <div className="form_and_description_grid">
        {currentStep === 0 && (
          <RequestForm
            request={request}
            requesting={requesting}
            onChange={handleChange}
            onSave={handleSave}
            errors={errors}
            clickwrap={state.clickwrap}
          />
        )}
        {currentStep === 1 && (
          <SelectDocuments onPrevious={onPrevious} onAddDocuments={onAddDocuments} />
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
      <Toaster position="top-center" />
    </section>
  );
};
