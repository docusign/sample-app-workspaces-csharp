import './SkeletonOnboarding.scss';

export const SkeletonOnboarding = ({ rowCount = 5 }) => {
  return (
    <div className="col-lg-8 skeleton-onboarding">
      <div className="form-holder bg-white">
        <div className="skeleton-title" />

        <div className="documents-table-wrapper">
          <div className="documents-table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>
                    <div className="header-content">
                      <div className="skeleton-table-header-cell" />
                    </div>
                  </th>
                  <th>
                    <div className="header-content">
                      <div className="skeleton-table-header-cell" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }).map((_, index) => (
                  <tr key={index}>
                    <td>
                      <div className="skeleton-table-cell" />
                    </td>
                    <td>
                      <div className="skeleton-table-cell" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
