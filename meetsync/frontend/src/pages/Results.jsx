import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await client.get(`/meetings/${id}/results`);
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch meeting results. Make sure database records exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  const handleCopyAll = () => {
    if (!data) return;
    let text = `Meeting: ${data.title}\n`;
    text += `Created at: ${new Date(data.created_at).toLocaleString()}\n\n`;
    
    text += `=== TRANSCRIPT ===\n`;
    text += `${data.transcript || 'No transcript generated.'}\n\n`;
    
    text += `=== ACTION ITEMS ===\n`;
    if (data.action_items && data.action_items.length > 0) {
      data.action_items.forEach((item, index) => {
        text += `${index + 1}. [Owner: ${item.owner}] ${item.task} (Deadline: ${item.deadline || 'N/A'}, Confidence: ${item.confidence})\n`;
      });
    } else {
      text += `None detected.\n`;
    }
    text += `\n`;
    
    text += `=== DECISIONS ===\n`;
    if (data.decisions && data.decisions.length > 0) {
      data.decisions.forEach((item, index) => {
        text += `- ${item.content}\n`;
      });
    } else {
      text += `None detected.\n`;
    }
    text += `\n`;
    
    text += `=== BLOCKERS ===\n`;
    if (data.blockers && data.blockers.length > 0) {
      data.blockers.forEach((item, index) => {
        text += `- Blocked by ${item.blocked_by || 'Unknown'}: ${item.content}\n`;
      });
    } else {
      text += `None detected.\n`;
    }

    navigator.clipboard.writeText(text)
      .then(() => alert('Successfully copied all meeting metadata and analysis!'))
      .catch((err) => alert('Failed to copy text: ' + err));
  };

  const handleExportPDF = () => {
    // Standard print call - we format the document using @media print in style blocks
    window.print();
  };

  // Styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #1e1e24',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
  };

  const metadataStyle = {
    color: '#94a3b8',
    fontSize: '14px',
    marginTop: '4px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
  };

  const btnSecondaryStyle = {
    padding: '10px 16px',
    backgroundColor: '#0a0a0c',
    border: '1px solid #1e1e24',
    borderRadius: '6px',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  };

  const btnPrimaryStyle = {
    padding: '10px 16px',
    backgroundColor: '#6366f1',
    border: '1px solid #6366f1',
    borderRadius: '6px',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  };

  const columnStyle = {
    backgroundColor: '#000000',
    border: '1px solid #1e1e24',
    borderRadius: '8px',
    padding: '24px',
    height: 'fit-content',
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  const colTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #1e1e24',
    paddingBottom: '10px',
  };

  const transcriptTextStyle = {
    color: '#cbd5e1',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
  };

  const itemCardStyle = {
    backgroundColor: '#0a0a0c',
    border: '1px solid #1e1e24',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '16px',
  };

  const confidenceBadgeStyle = (confidence) => {
    let bg = '#1e1b4b';
    let color = '#a5b4fc';
    if (confidence === 'high') {
      bg = '#064e3b';
      color = '#6ee7b7';
    } else if (confidence === 'low') {
      bg = '#7f1d1d';
      color = '#fca5a5';
    }
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      backgroundColor: bg,
      color: color,
      marginTop: '8px',
    };
  };

  if (loading) {
    return <div style={{ color: '#ffffff', textAlign: 'center', marginTop: '100px' }}>Loading intelligence results...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', backgroundColor: '#7f1d1d33', padding: '16px', borderRadius: '6px', border: '1px solid #ef44444d', marginBottom: '24px' }}>
          {error}
        </div>
        <button onClick={() => navigate('/')} style={btnPrimaryStyle}>Return to Upload</button>
      </div>
    );
  }

  return (
    <div style={containerStyle} className="printable-results">
      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          nav, button, header, .no-print {
            display: none !important;
          }
          .printable-results {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .results-grid {
            display: block !important;
          }
          .results-column {
            max-height: none !important;
            overflow-y: visible !important;
            border: none !important;
            padding: 0 !important;
            margin-bottom: 40px !important;
            page-break-inside: avoid !important;
          }
          .col-title {
            color: #000000 !important;
            border-bottom: 2px solid #000000 !important;
          }
          .card {
            background-color: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #000000 !important;
          }
        }
      `}</style>

      <header style={headerStyle} className="no-print">
        <div>
          <h1 style={titleStyle}>{data.title}</h1>
          <p style={metadataStyle}>
            Processed on {new Date(data.created_at).toLocaleString()}
          </p>
        </div>
        <div style={buttonContainerStyle}>
          <button onClick={handleCopyAll} style={btnSecondaryStyle}>
            📋 Copy All
          </button>
          <button onClick={handleExportPDF} style={btnPrimaryStyle}>
            📄 Export PDF
          </button>
        </div>
      </header>

      {/* Grid container */}
      <div style={gridStyle} className="results-grid">
        {/* Column 1: Transcript */}
        <div style={columnStyle} className="results-column">
          <h2 style={colTitleStyle} className="col-title">
            <span>📝</span> Transcript
          </h2>
          <div style={transcriptTextStyle}>
            {data.transcript || 'No transcript generated.'}
          </div>
        </div>

        {/* Column 2: Action Items */}
        <div style={columnStyle} className="results-column">
          <h2 style={colTitleStyle} className="col-title">
            <span>🎯</span> Action Items
          </h2>
          {data.action_items && data.action_items.length > 0 ? (
            data.action_items.map((item) => (
              <div key={item.id} style={itemCardStyle} className="card">
                <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#ffffff', fontWeight: 'bold' }} className="card-owner">
                  👤 {item.owner}
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.4' }} className="card-task">
                  {item.task}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    ⏰ Due: {item.deadline || 'No deadline'}
                  </span>
                  <span style={confidenceBadgeStyle(item.confidence)}>
                    {item.confidence}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>No action items extracted.</p>
          )}
        </div>

        {/* Column 3: Decisions & Blockers */}
        <div style={columnStyle} className="results-column">
          {/* Decisions section */}
          <h2 style={colTitleStyle} className="col-title">
            <span>💡</span> Decisions
          </h2>
          <div style={{ marginBottom: '32px' }}>
            {data.decisions && data.decisions.length > 0 ? (
              data.decisions.map((item) => (
                <div key={item.id} style={{ ...itemCardStyle, borderLeft: '4px solid #10b981' }} className="card">
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: '1.4' }}>
                    {item.content}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No key decisions extracted.</p>
            )}
          </div>

          {/* Blockers section */}
          <h2 style={{ ...colTitleStyle, marginTop: '24px' }} className="col-title">
            <span>⚠️</span> Blockers
          </h2>
          <div>
            {data.blockers && data.blockers.length > 0 ? (
              data.blockers.map((item) => (
                <div key={item.id} style={{ ...itemCardStyle, borderLeft: '4px solid #ef4444' }} className="card">
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.4' }}>
                    {item.content}
                  </p>
                  {item.blocked_by && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#fca5a5', fontWeight: 'bold' }}>
                      🚫 Blocked by: {item.blocked_by}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No blockers or issues extracted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
