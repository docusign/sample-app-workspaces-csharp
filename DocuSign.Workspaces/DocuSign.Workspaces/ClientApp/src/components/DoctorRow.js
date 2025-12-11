export const DoctorRow = ({ label, checked, onToggle }) => {
  return (
    <div className="doctor-row">
      <label className="doctor-row__label">
        <input
          type="radio"
          checked={checked}
          onChange={() => {}}
          onClick={onToggle}
          className="doctor-row__label__radio"
        />
        {label}
      </label>
    </div>
  );
};
