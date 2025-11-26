import { ReactComponent as CheckIcon } from '../assets/icons/check.svg';

const StepProgress = ({ steps, currentStep }) => {
  return (
    <div className="step-progress">
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
