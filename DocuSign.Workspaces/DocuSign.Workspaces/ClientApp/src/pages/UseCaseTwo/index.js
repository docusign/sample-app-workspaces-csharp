import React, { useState, useReducer, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'react-hot-toast';
import { RequestFormPhysician } from '../../components/RequestFormPhysician';
import GoBackArrow from '../../components/GoBackArrow';
import { ApiDescription } from '../../components/ApiDescription';
import { reducer } from './requestReducer';
import * as studentsAPI from '../../api/studentsAPI';
import { download } from '../../api/download';
import { TableDocuments } from '../../components/TableDocuments';
import { SomethingWentWrong } from '../../components/SomethingWentWrong';

const initialState = {
  errors: [],
  request: {
    email: '',
    files: [],
  },
  clickwrap: null,
};

export const UseCaseTwoPage = () => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [request, setRequestData] = useState({ ...initialState.request });
  const [requesting, setRequesting] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorOnboarding, setErrorOnboarding] = useState('');
  // const { accountStatus } = useOutletContext();
  //TODO: SET 0
  const [currentStep, setCurrentStep] = useState(0);

  async function handleSave(event) {
    // event.preventDefault();
    if (!formIsValid()) {
      return;
    }

    // const body = {
    //   'callback-url': process.env.REACT_APP_DS_RETURN_URL + '/signing_complete',
    //   'terms-name': t('Transcript.TermsName'),
    //   'terms-transcript': t('Transcript.DisplayName'),
    //   'display-name': t('Transcript.TermsTranscript'),
    // };
    setRequesting(true);
    try {
      // const response = await studentsAPI.getCliwrapForRequestTranscript(body);
      // dispatch({
      //   type: Actions.GET_CLICKWRAP_SUCCESS,
      //   payload: {
      //     clickwrap: response.clickwrap,
      //     envelopeId: response.envelope_id,
      //     redirectUrl: response.redirect_url,
      //   },
      // });
      // window.addEventListener(
      //   'message',
      //   (event) => getTranscript(event, response.clickwrap),
      //   false
      // );
      setRequestData(event);

      setCurrentStep(1);
    } catch (error) {
      setRequesting(false);
      toast.error(error.message);
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

  // const onPrevious = () => {
  //   if (currentStep >= 1) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };
  // const onAddDocuments = () => {
  //   if (currentStep <= 1) {
  //     setCurrentStep(currentStep + 1);
  //   }
  // };

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
      <h2>Care Plans approval inbox </h2>
      <div className="col-lg-6 second_title">
        As a staff member you will assign care plans and other documents for review by a specific
        physician
      </div>
      <div className="form_and_description_grid">
        {currentStep === 0 && (
          <RequestFormPhysician
            request={request}
            requesting={requesting}
            onChange={handleChange}
            onSave={handleSave}
            errors={errors}
            clickwrap={state.clickwrap}
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
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName="app-toast-container"
        toasterId="default"
        toastOptions={{
          className: 'app-toast',
          duration: 5000,
          removeDelay: 1000,
          success: {
            className: 'app-toast-success',
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
          error: {
            className: 'app-toast-error',
            duration: 3000,
          },
        }}
      />
    </section>
  );
};
