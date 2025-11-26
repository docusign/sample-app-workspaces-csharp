import { ReactComponent as ArrowTop } from '../assets/icons/table-arrow-top.svg';
import { ReactComponent as ArrowDown } from '../assets/icons/table-arrow-down.svg';
import { ReactComponent as ArrowsBoth } from '../assets/icons/table-arrow-both-way.svg';

export const SortIcon = ({ column, direction, key }) => {
  const isActive = key === column;
  const className = isActive ? 'sort-icon' : 'sort-icon inactive';

  if (!isActive) {
    return (
      <span className={className}>
        <ArrowsBoth />
      </span>
    );
  }

  return <span className={className}>{direction === 'asc' ? <ArrowTop /> : <ArrowDown />}</span>;
};
