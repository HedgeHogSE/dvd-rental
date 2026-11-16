import { Link, NavLink, useMatch, useNavigate } from 'react-router-dom';
import { useAuthSession } from './Auth/AuthSession';
import NotificationBell from './NotificationBell';

const accountLinks = [
  ['/movies', 'Фильмы'],
  ['/dvds', 'DVD'],
  ['/wishlist', 'Избранное'],
  ['/bookings', 'Бронирования'],
  ['/rentals', 'Аренда'],
];

const staffLinks = [
  ['/employee/movies', 'Фильмы'],
  ['/employee/dvds', 'DVD'],
  ['/employee/bookings', 'Бронирования'],
  ['/employee/rentals', 'Аренда'],
  ['/employee/issue', 'Выдача'],
  ['/employee/return', 'Возврат'],
];

const adminLinks = [
  ['/admin/dashboard', 'Сводка'],
  ['/admin/users', 'Пользователи'],
];

const NavItems = ({ links }) => {
  const isHome = useMatch('/');
  return links.map(([path, label]) => (
    <NavLink
      key={path}
      to={path}
      className={({ isActive }) => isActive || (isHome && path === '/movies') ? 'active' : undefined}
    >
      {label}
    </NavLink>
  ));
};

const Navigation = () => {
  const { user, isAdmin, isStaff, signOut } = useAuthSession();
  const navigate = useNavigate();
  const signedIn = Boolean(user);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="site-header">
      <div className="site-width">
        <div className="header-main">
          <Link className="wordmark" to={signedIn ? '/movies' : '/login'}>
            <span className="disc-mark" aria-hidden="true" />
            Видеопрокат
          </Link>
          {signedIn && (
            <>
              <nav className="nav-links account-nav" aria-label="Каталог и личный кабинет">
                <NavItems links={accountLinks} />
              </nav>
              <div className="header-account">
                <NotificationBell />
                <span className="account-name">{user.name}</span>
                <button type="button" onClick={handleLogout}>Выйти</button>
              </div>
            </>
          )}
        </div>
        {signedIn && isStaff && (
          <nav className="nav-links work-nav" aria-label="Сотрудник">
            <span>Сотрудник</span>
            <NavItems links={staffLinks} />
          </nav>
        )}
        {signedIn && isAdmin && (
          <nav className="nav-links work-nav" aria-label="Администрирование">
            <span>Администрирование</span>
            <NavItems links={adminLinks} />
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;
