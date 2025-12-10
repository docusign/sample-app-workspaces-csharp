import React, { useState, useEffect } from 'react';
import { ReactComponent as CheckIcon } from '../assets/icons/check.svg';

const StepProgress = ({ steps, currentStep }) => {
  const [isCompact, setIsCompact] = useState(window.innerWidth < 500);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 500);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isCompact) {
    return (
      <div className="step-progress-compact">
        <div className="step-text">
          STEP {currentStep + 1} OF {steps.length}
        </div>
        <div className="step-dots">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={index}
                className={`step-dot step-circle ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}
              >
                {isCompleted ? (
                  <CheckIcon className="check_icon" />
                ) : isActive ? (
                  <div className={'step-circle-active '} />
                ) : (
                  ''
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className=" col-lg-9 step-progress">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div className="step-wrapper" key={index}>
            <div className="step">
              <div
                className={'step-circle ' + (isCompleted ? 'completed' : isActive ? 'active' : '')}
              >
                {isCompleted ? (
                  <CheckIcon className="check_icon" />
                ) : isActive ? (
                  <div className={'step-circle-active '} />
                ) : (
                  ''
                )}
              </div>
              <div className="step-label">{step}</div>

              {index < steps.length - 1 && (
                <div
                  className={'step-line ' + (isCompleted ? 'completed' : isActive ? 'active' : '')}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepProgress;
