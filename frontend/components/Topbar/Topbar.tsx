import { Link } from 'react-router-dom';

export function Topbar() {
  return (
    <div className="topbar">
      <img className="topbar__logo" src="/logo.svg" alt="" />
      <Link className="topbar__button" to="/new-reed">
        New reed
      </Link>
      <Link className="topbar__link" to="/">
        Current reeds
      </Link>
      <Link className="topbar__link" to="/discarded">
        Discarded reeds
      </Link>
    </div>
  );
}
