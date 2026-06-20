import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const History = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await client.get('/meetings');
        setMeetings(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch meeting history. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleRowClick = (meeting) => {
    if (meeting.status === 'done') {
      navigate(`/results/${meeting.id}`);
    }
  };

  // Styles
  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px 0',
  };

  const headerStyle = {
    marginBottom: '32px',
    borderBottom: '1px solid #1e1e24',
    paddingBottom: '16px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 8px 0',
  };

  const subtitleStyle = {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  };

  const tableContainerStyle = {
    backgroundColor: '#000000',
    border: '1px solid #1e1e24',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  };

  const thStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid #1e1e24',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#050507',
  };

  const trStyle = (isClickable) => ({
    borderBottom: '1px solid #1e1e24',
    cursor: isClickable ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
  });

  const tdStyle = {
    padding: '18px 24px',
    color: '#cbd5e1',
    fontSize: '14px',
    verticalAlign: 'middle',
  };

  const titleColStyle = {
    fontWeight: '600',
    color: '#ffffff',
  };

  const statusBadgeStyle = (status) => {
    let bg = '#78350f'; // amber bg for processing
    let color = '#fcd34d'; // yellow text
    let label = 'processing';

    if (status === 'done') {
      bg = '#064e3b';
      color = '#6ee7b7';
      label = 'done';
    } else if (status === 'failed') {
      bg = '#7f1d1d';
      color = '#fca5a5';
      label = 'failed';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: bg,
        color: color,
        textTransform: 'capitalize',
      }}>
        {label}
      </span>
    );
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 40px',
    backgroundColor: '#000000',
    border: '1px solid #1e1e24',
    borderRadius: '12px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background-color 0.2s',
  };

  if (loading) {
    return <div style={{ color: '#ffffff', textAlign: 'center', marginTop: '100px' }}>Loading history...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
        <div style={{
          color: '#ef4444',
          backgroundColor: '#7f1d1d33',
          padding: '16px',
          borderRadius: '6px',
          border: '1px solid #ef44444d',
          marginBottom: '24px'
        }}>
          {error}
        </div>
        <button onClick={() => window.location.reload()} style={buttonStyle}>Retry</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Meeting History</h1>
        <p style={subtitleStyle}>View and manage all transcribed meeting intelligence.</p>
      </header>

      {meetings.length === 0 ? (
        <div style={emptyStateStyle}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📜</span>
          <h3 style={{ color: '#ffffff', fontSize: '18px', margin: '0 0 8px 0' }}>No Meetings Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            You haven't uploaded any meetings yet. Start by uploading an audio file!
          </p>
          <button onClick={() => navigate('/')} style={buttonStyle}>
            Upload Meeting
          </button>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Meeting Title</th>
                <th style={thStyle}>Created At</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => {
                const isClickable = meeting.status === 'done';
                return (
                  <tr
                    key={meeting.id}
                    onClick={() => handleRowClick(meeting)}
                    style={trStyle(isClickable)}
                    className="history-row"
                  >
                    <td style={{ ...tdStyle, ...titleColStyle }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🎙️</span>
                        <span>{meeting.title}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {new Date(meeting.created_at).toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                      {statusBadgeStyle(meeting.status)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {isClickable ? (
                        <span style={{ color: '#6366f1', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          View Results <span>→</span>
                        </span>
                      ) : meeting.status === 'failed' ? (
                        <span style={{ color: '#ef4444', fontSize: '13px' }}>Failed</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span className="pulse-dot"></span> Processing
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Embedded CSS for Row hover effects and pulse animation */}
      <style>{`
        .history-row:hover {
          background-color: #0d0d11 !important;
        }
        .history-row:hover td {
          color: #ffffff !important;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #eab308;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.85);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(0.85);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default History;
