import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/weather" className={({ isActive }) => isActive ? 'active' : ''}>
            Weather
          </NavLink>
        </li>
        <li>
          <NavLink to="/crops" className={({ isActive }) => isActive ? 'active' : ''}>
            Crops
          </NavLink>
        </li>
        <li>
          <NavLink to="/pests" className={({ isActive }) => isActive ? 'active' : ''}>
            Pests
          </NavLink>
        </li>
        <li>
          <NavLink to="/market" className={({ isActive }) => isActive ? 'active' : ''}>
            Market
          </NavLink>
        </li>
        <li>
          <NavLink to="/feedback" className={({ isActive }) => isActive ? 'active' : ''}>
            Feedback
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
