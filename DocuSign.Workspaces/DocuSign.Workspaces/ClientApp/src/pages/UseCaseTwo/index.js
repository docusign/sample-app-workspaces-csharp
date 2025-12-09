import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'react-hot-toast';
import { RequestFormPhysician } from '../../components/RequestFormPhysician';
import GoBackArrow from '../../components/GoBackArrow';
import { ApiDescription } from '../../components/ApiDescription';
import { TableDocuments } from '../../components/TableDocuments';
import { SkeletonTableDocuments } from '../../components/SkeletonTableDocuments';
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
  const [currentStep, setCurrentStep] = useState(0);
  const [listFiles, setListFiles] = useState([]);
  const [errorOnboarding, setErrorOnboarding] = useState('');
  const [selectedPhysician, setSelectedPhysician] = useState(undefined);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 500);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  async function handleSave(event) {
    if (!formIsValid()) {
      return;
    }
    setRequesting(true);
    setCurrentStep(1);
    scrollToTop();

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
      <div className={requesting ? 'blur-content' : ''}>
        <GoBackArrow />
        <h2>{t('UseCaseTwo.Title')}</h2>
        <div className="body1">{t('UseCaseTwo.Description')}</div>
      </div>
      <div className="form_and_description_grid form_and_description_grid_plus">
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
                scrollToTop();
              }}
            />
          ) : requesting ? (
            <SkeletonTableDocuments />
          ) : (
            <TableDocuments listFiles={listFiles} />
          ))}
        <ApiDescription requesting={requesting} />
      </div>
      <Toaster
        position={isMobile ? 'top-right' : 'top-center'}
        containerStyle={isMobile ? { top: 95, right: 8 } : { top: 85 }}
      />
    </section>
  );
};
