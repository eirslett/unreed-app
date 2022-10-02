export function Topbar() {
  return (
    <div className="topbar">
      <img className="topbar__logo" src="./logo.svg" alt="" />
      <a href="#">Current reeds</a>
      <a href="#">Discarded reeds</a>
      <button className="topbar__button">New reed</button>
      <button className="topbar__button topbar__button--right">Login</button>
    </div>
  );
}
