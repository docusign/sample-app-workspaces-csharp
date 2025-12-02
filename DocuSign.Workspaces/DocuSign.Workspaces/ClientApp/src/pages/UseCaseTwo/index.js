import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'react-hot-toast';
import { RequestFormPhysician } from '../../components/RequestFormPhysician';
import GoBackArrow from '../../components/GoBackArrow';
import { ApiDescription } from '../../components/ApiDescription';
import { TableDocuments } from '../../components/TableDocuments';
import { SomethingWentWrong } from '../../components/SomethingWentWrong';
import { API_BASE } from '../../components/Layout';
import { prepareDocuments } from '../../components/helper/filesConverter';

const initialState = {
  errors: [],
  request: {
    email: '',
    files: [],
  },
};

const urlGetPhysician = `${API_BASE}/api/care-plans/physicians`;
const urlSendDocuments = `${API_BASE}/api/care-plans/submit-physician`;

export const UseCaseTwoPage = () => {
  const { t } = useTranslation();
  const [request, setRequestData] = useState({ ...initialState.request });
  const [requesting, setRequesting] = useState(false);
  const [isLoadingPhysician, setIsLoadingPhysician] = useState(false);
  const [errors, setErrors] = useState({});
  const [listPhysician, setListPhysician] = useState([]);
  const [listFiles, setListFiles] = useState([]);
  const [errorOnboarding, setErrorOnboarding] = useState('');
  const [selectedPhysician, setSelectedPhysician] = useState(undefined);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (listPhysician?.length) setSelectedPhysician(listPhysician[0]);
  }, [listPhysician]);

  const getPhysicians = async () => {
    try {
      setIsLoadingPhysician(true);
      const res = await fetch(urlGetPhysician, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`${t('Common.ServerError')}${res.status}`);
      }
      const physician = await res.json();
      setListPhysician(physician);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoadingPhysician(false);
    }
  };

  useEffect(() => {
    getPhysicians();
  }, []);

  async function handleSave(event) {
    if (!formIsValid()) {
      return;
    }
    setRequesting(true);
    try {
      const documents = await prepareDocuments(event.files);
      const payload = {
        physician: selectedPhysician,
        documents,

        email: request.email,
      };
      const res = await fetch(urlSendDocuments, {
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
      setListFiles(data);
    } catch (error) {
      setErrorOnboarding(t('Common.Error'));
    } finally {
      setRequesting(false);
      setCurrentStep(1);
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
      <div className="col-lg-6 body1">{t('UseCaseTwo.Description')}</div>
      <div className="form_and_description_grid">
        {currentStep === 0 && (
          <RequestFormPhysician
            request={request}
            requesting={requesting}
            onChange={handleChange}
            onSave={handleSave}
            errors={errors}
            listPhysician={listPhysician}
            isLoadingPhysician={isLoadingPhysician}
            selectedPhysician={selectedPhysician}
            setSelectedPhysician={setSelectedPhysician}
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
            <TableDocuments listFiles={listFiles} />
          ))}
        <ApiDescription />
      </div>
      <Toaster position="top-center" />
    </section>
  );
};
