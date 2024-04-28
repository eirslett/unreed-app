import { Fragment, useEffect } from 'react';
import { useParams } from 'react-router';
import clsx from 'clsx';
import { Reed, ReedHistory, instrumentName } from '../../types';
import { findColorHex } from '../ColorPicker/utils';
import { useData } from '../Data/Data';
import { timestampToLocaleFormattedDate } from '../../utils/date';
import { useNavigate } from 'react-router-dom';

export function ReedRoute() {
  const data = useData();
  const { id } = useParams();
  if (id === undefined) {
    return <div></div>;
  }
  const reed = data.reeds.reeds[id];
  if (reed === undefined) {
    return <div></div>;
  }
  return <ReedPage reed={reed} />;
}

function Descriptions(entries: Record<string, string>) {
  return (
    <dl className="reed-page__dl">
      {Object.entries(entries).map(([key, value]) => (
        <Fragment key={key}>
          <dt className="reed-page__dt">{key}</dt>
          <dd className="reed-page__dd">{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

function ActionButton({
  title,
  variant,
}: {
  title: string;
  variant?: 'primary' | 'warning' | undefined;
}) {
  return (
    <button
      className={clsx(
        'reed-page__action-button',
        variant === 'warning' && 'reed-page__action-button--warning',
      )}
    >
      {title}
    </button>
  );
}

function Event(props: ReedHistory) {
  let el;
  switch (props.action) {
    case 'create':
      el = (
        <>
          <span className="reed-page__event__primary-text">Tied up the reed.</span>{' '}
          {props.comments && (
            <div>
              <q style={{ fontStyle: 'italic' }}>{props.comments}</q>
            </div>
          )}
        </>
      );
      break;
    case 'clip':
      el = (
        <span className="reed-page__event__primary-text">Clipped the reed to {props.length}</span>
      );
      break;
    case 'discard':
      el = <span className="has-text-danger">Discarded the reed.</span>;
      break;
    case 'comment':
      el = <q style={{ fontStyle: 'italic' }}>{props.comments}</q>;
      break;
    case 'play':
      el = (
        <>
          <span className="reed-page__event__primary-text">
            Played on the reed{props.duration && ` (duration ${props.duration} minutes)`}
            {props.comment ? ':' : null}
          </span>{' '}
          {props.comment && <q style={{ fontStyle: 'italic' }}>{props.comment}</q>}
        </>
      );
      break;
    case 'scrape':
      el = (
        <>
          <span className="reed-page__event__primary-text">Scraped the reed:</span>{' '}
          <q style={{ fontStyle: 'italic' }}>{props.comments}</q>
        </>
      );
      break;
    //default:
    //  el = `Unknown action (${props.action})`;
  }

  return (
    <div className="reed-page__entry">
      <div className="reed-page__entry-time">{timestampToLocaleFormattedDate(props.time)}</div>
      {el}
    </div>
  );
}

export function ReedPage({ reed }: { reed: Reed }) {
  // @ts-expect-error - TS doesn't know about CSS custom properties
  const style: CSSProperties = {
    '--reed-color': findColorHex(reed.data.threadColor),
    viewTransitionName: 'reed-card', // 'reed-card-' + reed.data.reedIdentification,
  };

  /*
  useEffect(() => {
    document.body.style.background = findColorHex(reed.data.threadColor);
    return () => {
      document.body.style.background = '';
    };
  }, [reed.data.threadColor]);
  */

  function BackButton() {
    const navigate = useNavigate();
    return (
      <button className="reed-page__back-button" aria-label="Back" onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
          fill="currentColor"
        >
          <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
        </svg>
      </button>
    );
  }

  return (
    <article className="reed-page" style={style}>
      <div className="reed-page__two-columns">
        <div className="reed-page__descriptions">
          <div className="reed-page__header">
            <BackButton />
            <h1 className="reed-page__h1">{reed.data.reedIdentification}</h1>
          </div>
          <Descriptions
            {...{
              'Reed type': instrumentName(reed.data.reedType),
              'Thread color': reed.data.threadColor,
              'Cane producer': reed.data.caneProducer,
              'Cane diameter': reed.data.caneDiameter,
              'Cane hardness': reed.data.caneHardness,
              'Cane density': reed.data.caneDensity,
              'Gouge thickness': reed.data.gougeThickness,
              'Shaper form': reed.data.shaperForm,
            }}
          />
          <hr className="reed-page__hr" />
          <Descriptions
            {...{
              'Staple model': reed.data.stapleModel,
              'Staple length': reed.data.stapleLength,
            }}
          />
          <hr className="reed-page__hr" />
          <Descriptions
            {...{
              'Initial tied reed length': reed.data.tiedReedLength,
              'Current length': reed.data.currentLength,
            }}
          />
        </div>
        <div>
          <div className="reed-page__actions">
            <h2 className="reed-page__h2">Actions</h2>
            <div className="reed-page__action-buttons">
              <ActionButton title="Add a comment" />
              <ActionButton title="I played on this reed" />
              <ActionButton title="I scraped the reed" />
              <ActionButton title="I clipped the reed's tip" />
              <ActionButton title="Run a diagnostic test" />
              <ActionButton variant="warning" title="Discard the reed" />
            </div>
          </div>
          <div className="reed-page__history">
            <h2 className="reed-page__h2">History</h2>
            {reed.history.map((entry, i) => (
              <Event key={i} {...entry} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
