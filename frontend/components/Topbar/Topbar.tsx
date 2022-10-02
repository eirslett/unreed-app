export function Topbar() {
  return (
    <div className="topbar">
      <img className="topbar__logo" src="./logo.svg" alt="" />
      <a className="topbar__link" href="#">
        Current reeds
      </a>
      <a className="topbar__link" href="#">
        Discarded reeds
      </a>
      <button className="topbar__button topbar__button--right">New reed</button>
    </div>
  );
}
