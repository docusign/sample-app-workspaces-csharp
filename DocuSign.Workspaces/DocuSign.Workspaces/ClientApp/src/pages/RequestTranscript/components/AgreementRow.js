import React from 'react';

export const AgreementRow = ({ label, checked, onToggle, onPreview }) => {
  return (
    <div className="agreement-row">
      <label className="agreement-row__label">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="agreement-row__checkbox"
        />
        {label}

        <button onClick={onPreview} className="agreement-row__preview-btn">
          Preview
        </button>
      </label>
    </div>
  );
};
