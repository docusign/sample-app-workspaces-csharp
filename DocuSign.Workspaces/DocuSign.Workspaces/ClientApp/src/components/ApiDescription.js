import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import parse from 'html-react-parser';
import { Collapse } from 'react-bootstrap';
import { ReactComponent as MinusIcon } from '../assets/icons/minus.svg';
import { ReactComponent as PlusIcon } from '../assets/icons/add.svg';
import { ApiDescriptionSkeleton } from './ApiDescriptionSkeleton';
import './ApiDescription.scss';

export const ApiDescription = ({ requesting }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  if (requesting) {
    return <ApiDescriptionSkeleton isBig={open} />;
  }

  return (
    <div className="col-lg-4 pb-4 behind_scenes">
      <div id="accordion">
        <div className="cardCollapse">
          <div className="cardCollapse-header" id="headingOne">
            <h5 className="mb-0  flex-fill">
              <button
                className="btn-see-more"
                data-toggle="collapse"
                data-target="#collapseOne"
                aria-expanded="false"
                aria-controls="collapseOne"
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <div className="collapsed_button">
                  <span className="collapsed_see_more">{t('ApiDescription.SeeMore')} </span>
                  {open ? (
                    <MinusIcon className="plus_minus" />
                  ) : (
                    <PlusIcon className="plus_minus" />
                  )}
                </div>
              </button>
            </h5>
          </div>
          <div id="collapseOne" aria-labelledby="headingOne" data-parent="#accordion">
            <Collapse in={open}>
              <div className="card-body">{parse(t('ApiDescription.CodeFlow'))}</div>
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
};
