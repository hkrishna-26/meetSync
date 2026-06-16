import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

const Processing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('uploaded');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const steps = ['uploaded', 'transcribing', 'analysing', 'done'];

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await client.get(`/meetings/${id}/status`);
        const currentStatus = response.data.status;
        setTitle(response.data.title);
        setStatus(currentStatus);

        if (currentStatus === 'done') {
          navigate(`/results/${id}`);
        } else if (currentStatus === 'failed') {
          setError('Pipeline failed during execution. Check backend/worker logs.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch meeting status. Ensure the server is online.');
      }
    };

    // Initial poll
    checkStatus();

    // Poll every 3 seconds
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [id, navigate]);

  // Styles
  const containerStyle = {
    maxWidth: '600px',
    margin: '60px auto 0 auto',
    padding: '40px',
    backgroundColor: '#000000',
    borderRadius: '12px',
    border: '1px solid #1e1e24',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px',
  };

  const meetingTitleStyle = {
    fontSize: '18px',
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: '32px',
  };

  const stepsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '24px',
    maxWidth: '300px',
    margin: '0 auto 40px auto',
  };

  const getStepStyle = (stepName) => {
    const currentIndex = steps.indexOf(status);
    const stepIndex = steps.indexOf(stepName);
    
    let color = '#475569'; // default pending
    let dotBg = '#0a0a0c';
    let dotBorder = '2px solid #1e1e24';

    if (stepIndex === currentIndex) {
      color = '#6366f1'; // current active
      dotBg = '#6366f1';
      dotBorder = '2px solid #6366f1';
    } else if (stepIndex < currentIndex) {
      color = '#ffffff'; // completed
      dotBg = '#10b981';
      dotBorder = '2px solid #10b981';
    }

    return {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      color: color,
      fontSize: '16px',
      fontWeight: stepIndex === currentIndex ? 'bold' : 'normal',
      dotBg,
      dotBorder,
    };
  };

  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid #1e1e24',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    margin: '0 auto 24px auto',
    animation: 'spin 1s linear infinite',
  };

  const errorStyle = {
    color: '#ef4444',
    backgroundColor: '#7f1d1d33',
    padding: '16px',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '24px',
    border: '1px solid #ef44444d',
  };

  return (
    <div style={containerStyle}>
      {/* Dynamic keyframe injection for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {!error && <div style={spinnerStyle}></div>}
      <h1 style={titleStyle}>AI Pipeline Processing</h1>
      {title && <p style={meetingTitleStyle}>"{title}"</p>}

      {error ? (
        <div style={errorStyle}>{error}</div>
      ) : (
        <div style={stepsContainerStyle}>
          {steps.map((step) => {
            const stepStyles = getStepStyle(step);
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: stepStyles.color, fontWeight: stepStyles.fontWeight }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: stepStyles.dotBg,
                  border: stepStyles.dotBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  {steps.indexOf(step) < steps.indexOf(status) ? '✓' : steps.indexOf(step) + 1}
                </div>
                <span style={{ textTransform: 'capitalize' }}>
                  {step === 'done' ? 'completed' : step}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>
        Please do not close this window. Groq models are scanning transcription and generating actions.
      </p>
    </div>
  );
};

export default Processing;
