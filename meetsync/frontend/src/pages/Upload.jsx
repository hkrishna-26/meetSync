import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!title) {
        const nameWithoutExt = e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        const nameWithoutExt = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag an audio file.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a meeting title.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('meeting_title', title);

    try {
      const response = await client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const meetingId = response.data.id;
      navigate(`/processing/${meetingId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload audio file. Ensure the backend and database are running.');
      setLoading(false);
    }
  };

  // Styles
  const containerStyle = {
    maxWidth: '600px',
    margin: '40px auto 0 auto',
    padding: '32px',
    backgroundColor: '#000000',
    borderRadius: '12px',
    border: '1px solid #1e1e24',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px',
  };

  const subtitleStyle = {
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '32px',
  };

  const formGroupStyle = {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: '14px',
  };

  const inputStyle = {
    padding: '12px 16px',
    backgroundColor: '#0a0a0c',
    border: '1px solid #1e1e24',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    transition: 'border 0.2s',
  };

  const dragZoneStyle = {
    border: isDragActive ? '2px dashed #6366f1' : '2px dashed #1e1e24',
    borderRadius: '8px',
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: isDragActive ? '#1e1b4b' : '#0a0a0c',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: loading ? '#312e81' : '#6366f1',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
  };

  const errorStyle = {
    color: '#ef4444',
    backgroundColor: '#7f1d1d33',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '24px',
    border: '1px solid #ef44444d',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Upload Meeting Audio</h1>
      <p style={subtitleStyle}>Transcribe, detect speakers, and extract action items using AI.</p>

      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Meeting Title</label>
          <input
            type="text"
            placeholder="e.g. Weekly Sync, Project Launch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Audio File</label>
          <div
            style={dragZoneStyle}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input
              id="file-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '40px' }}>🎙️</span>
            {file ? (
              <div>
                <p style={{ color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>{file.name}</p>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB - Click or drag to replace
                </p>
              </div>
            ) : (
              <div>
                <p style={{ color: '#ffffff', fontWeight: 'bold', margin: '4px 0' }}>
                  Drag & Drop audio file here
                </p>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                  Supports MP3, WAV, M4A, OGG, WEBM (Max 25MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Uploading & Initializing...' : 'Start Intelligence Pipeline'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
