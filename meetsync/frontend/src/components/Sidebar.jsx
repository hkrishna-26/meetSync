import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const sidebarStyle = {
    width: '260px',
    backgroundColor: '#000000',
    borderRight: '1px solid #1e1e24',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    boxSizing: 'border-box',
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
  };

  const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const navListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: isActive ? '#ffffff' : '#94a3b8',
    backgroundColor: isActive ? '#1e1b4b' : 'transparent',
    borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={sidebarStyle}>
      <div style={logoStyle}>
        <span style={{ fontSize: '28px' }}>⚡</span> MeetSync
      </div>
      <nav style={{ flex: 1 }}>
        <ul style={navListStyle}>
          <li>
            <NavLink to="/" style={linkStyle}>
              <span style={{ marginRight: '12px' }}>📁</span> Upload Meeting
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" style={linkStyle}>
              <span style={{ marginRight: '12px' }}>📜</span> History
            </NavLink>
          </li>
        </ul>
      </nav>
      <div style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: 'auto' }}>
        v0.1.0 © MeetSync
      </div>
    </div>
  );
};

export default Sidebar;
