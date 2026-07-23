import { Link, NavLink } from 'react-router-dom';

export function TopBar() {
  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand">
        人生进度 RPG
      </Link>
      <nav className="topbar__nav" aria-label="主导航">
        <NavLink to="/" end>
          {(state) => <span className={state.isActive ? 'nav-link nav-link--active' : 'nav-link'}>今日</span>}
        </NavLink>
        <NavLink to="/record">
          {(state) => (
            <span className={state.isActive ? 'nav-link nav-link--active' : 'nav-link'}>记录</span>
          )}
        </NavLink>
        <NavLink to="/history">
          {(state) => (
            <span className={state.isActive ? 'nav-link nav-link--active' : 'nav-link'}>历史</span>
          )}
        </NavLink>
        <NavLink to="/settings">
          {(state) => (
            <span className={state.isActive ? 'nav-link nav-link--active' : 'nav-link'}>设置</span>
          )}
        </NavLink>
      </nav>
    </header>
  );
}
