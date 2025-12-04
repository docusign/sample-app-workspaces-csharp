import './SkeletonDoctors.scss';

export const SkeletonDoctors = ({ count = 3 }) => {
  return (
    <div className="skeleton-row">
      {Array.from({ length: count }).map((_, idx) => (
        <div className="doctor-skeleton" key={idx}>
          <div className="doctor-skeleton__circle" />
          <div className="doctor-skeleton__text" />
        </div>
      ))}
    </div>
  );
};
