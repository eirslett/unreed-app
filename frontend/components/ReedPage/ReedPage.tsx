import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { parseISO } from 'date-fns';
import { v4 as uuid } from 'uuid';
import clsx from 'clsx';
import { LogEntry, Reed, ReedHistory, instrumentName } from '../../types';
import { findColorHex } from '../ColorPicker/utils';
import { useData } from '../Data/Data';
import { timestampToLocaleFormattedDate } from '../../utils/date';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import {
  AddCommentModal,
  ClippedTipModal,
  DiscardModal,
  PlayedReedModal,
  ScrapedReedModal,
} from './Modals';

export function ReedRoute() {
  const data = useData();
  const params = useParams();
  const id = params.id;
  if (id === undefined || id === null) {
    return <div></div>;
  }

  const reed = data.reeds.reeds[id];
  if (reed === undefined) {
    return <div></div>;
  }

  function addComment(meta: { comment: string }) {
    data.write({
      entry_id: uuid(),
      entry_type: 'comment',
      data: meta,
      reed_id: id!,
      entry_timestamp: new Date().toISOString(),
    });
  }

  function playedReed(meta: { duration: string; comment: string }) {
    data.write({
      entry_id: uuid(),
      entry_type: 'play',
      data: meta,
      reed_id: id!,
      entry_timestamp: new Date().toISOString(),
    });
  }

  function scrapedReed(meta: { comment: string }) {
    data.write({
      entry_id: uuid(),
      entry_type: 'scrape',
      data: meta,
      reed_id: id!,
      entry_timestamp: new Date().toISOString(),
    });
  }

  function clippedTip(meta: { length: string }) {
    data.write({
      entry_id: uuid(),
      entry_type: 'clip',
      data: meta,
      reed_id: id!,
      entry_timestamp: new Date().toISOString(),
    });
  }

  function discard() {
    data.write({
      entry_id: uuid(),
      entry_type: 'discard',
      data: {},
      reed_id: id!,
      entry_timestamp: new Date().toISOString(),
    });
  }

  return (
    <ReedPage
      reed={reed}
      addComment={addComment}
      playedReed={playedReed}
      scrapedReed={scrapedReed}
      clippedTip={clippedTip}
      discard={discard}
    />
  );
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

function Skull() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
    >
      <path d="M240-80v-170q-39-17-68.5-45.5t-50-64.5q-20.5-36-31-77T80-520q0-158 112-259t288-101q176 0 288 101t112 259q0 42-10.5 83t-31 77q-20.5 36-50 64.5T720-250v170H240Zm80-80h40v-80h80v80h80v-80h80v80h40v-142q38-9 67.5-30t50-50q20.5-29 31.5-64t11-74q0-125-88.5-202.5T480-800q-143 0-231.5 77.5T160-520q0 39 11 74t31.5 64q20.5 29 50.5 50t67 30v142Zm100-200h120l-60-120-60 120Zm-80-80q33 0 56.5-23.5T420-520q0-33-23.5-56.5T340-600q-33 0-56.5 23.5T260-520q0 33 23.5 56.5T340-440Zm280 0q33 0 56.5-23.5T700-520q0-33-23.5-56.5T620-600q-33 0-56.5 23.5T540-520q0 33 23.5 56.5T620-440ZM480-160Z" />
    </svg>
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
      el = (
        <div className="reed-page__discard-event">
          <Skull />
          <div>Discarded the reed.</div>
        </div>
      );
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
      <div className="reed-page__entry-time">
        {timestampToLocaleFormattedDate(parseISO(props.time).getTime())}
      </div>
      {el}
    </div>
  );
}

export function ReedPage({
  reed,
  addComment,
  playedReed,
  scrapedReed,
  clippedTip,
  discard,
}: {
  reed: Reed;
  addComment: (data: { comment: string }) => void;
  playedReed: (data: { duration: string; comment: string }) => void;
  scrapedReed: (data: { comment: string }) => void;
  clippedTip: (data: { length: string }) => void;
  discard: () => void;
}) {
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

  const [modal, setModal] = useState<string | undefined>(undefined);

  function closeModal() {
    setModal(undefined);
  }

  function openCommentsModal() {
    setModal('addComment');
  }

  function openPlayedReedModal() {
    setModal('playedReed');
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
            {!reed.discarded && (
              <>
                <h2 className="reed-page__h2">Actions</h2>
                <div className="reed-page__action-buttons">
                  <Button variant="primary" onClick={openCommentsModal}>
                    Add a comment
                  </Button>
                  <Button variant="primary" onClick={openPlayedReedModal}>
                    I played on this reed
                  </Button>
                  <Button variant="primary" onClick={() => setModal('scrapedReed')}>
                    I scraped the reed
                  </Button>
                  <Button variant="primary" onClick={() => setModal('clippedTip')}>
                    I clipped the reed's tip
                  </Button>
                  {/*<Button variant="primary">Run a diagnostic test</Button>*/}
                  <Button variant="warning" onClick={() => setModal('discard')}>
                    Discard the reed
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="reed-page__history">
            <h2 className="reed-page__h2">History</h2>
            {reed.history.map((entry, i) => (
              <Event key={i} {...entry} />
            ))}
          </div>
        </div>
      </div>
      <AddCommentModal
        isOpen={modal === 'addComment'}
        closeModal={closeModal}
        onSubmit={addComment}
      />
      <PlayedReedModal
        isOpen={modal === 'playedReed'}
        closeModal={closeModal}
        onSubmit={playedReed}
      />
      <ScrapedReedModal
        isOpen={modal === 'scrapedReed'}
        closeModal={closeModal}
        onSubmit={scrapedReed}
      />
      <ClippedTipModal
        isOpen={modal === 'clippedTip'}
        closeModal={closeModal}
        onSubmit={clippedTip}
      />
      <DiscardModal isOpen={modal === 'discard'} closeModal={closeModal} onSubmit={discard} />
    </article>
  );
}
