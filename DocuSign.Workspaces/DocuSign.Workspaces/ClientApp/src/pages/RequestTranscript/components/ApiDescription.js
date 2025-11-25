import React from 'react';
import { useTranslation } from 'react-i18next';
import parse from 'html-react-parser';
import { Collapse } from 'react-bootstrap';
import { ReactComponent as MinusIcon } from '../../../assets/icons/minus.svg';
import { ReactComponent as PlusIcon } from '../../../assets/icons/add.svg';

export const ApiDescription = () => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="col-lg-4 pt-5 pb-4 behind_scenes">
      <div id="accordion">
        <div className="cardCollapse">
          <div className="cardCollapse-header" id="headingOne">
            <h5 className="mb-0">
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
                <h3>
                  {t('ApiDescription.SeeMore')}{' '}
                  {open ? (
                    <MinusIcon className="plus_minus" />
                  ) : (
                    <PlusIcon className="plus_minus" />
                  )}
                </h3>
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
