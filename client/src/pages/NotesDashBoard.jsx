import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getStoredUser } from '../utils/auth';
import Navbar from '../components/Navbar';
import '../styles/notesDashboard.css';

function NotesDashboard() {
  const [user, setUser] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [academicYear, setAcademicYear] = useState('');
  const [subject, setSubject] = useState('');
  const [notesType, setNotesType] = useState('');
  
  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  // Notes list state
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your study assistant. Ask me anything about your notes!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    fetchNotes();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // const handleChatSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!chatInput.trim() || chatLoading) return;

  //   const userMessage = chatInput.trim();
  //   setChatInput('');
    
  //   // Add user message to chat
  //   setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
  //   setChatLoading(true);

  //   try {
  //     const response = await axios.post('http://localhost:8000/chat/', {
  //       msg: userMessage,
  //       k: 3
  //     });

  //     // Add assistant response
  //     setChatMessages(prev => [...prev, { 
  //       role: 'assistant', 
  //       content: response.data.response || 'Sorry, I couldn\'t process that request.'
  //     }]);
  //   } catch (error) {
  //     console.error('Chat error:', error);
  //     setChatMessages(prev => [...prev, { 
  //       role: 'assistant', 
  //       content: 'Sorry, I\'m having trouble connecting. Please make sure the AI server is running.'
  //     }]);
  //   } finally {
  //     setChatLoading(false);
  //   }
  // };
const handleChatSubmit = async (e) => {
  e.preventDefault();
  if (!chatInput.trim() || chatLoading) return;

  const userMessage = chatInput.trim();
  setChatInput('');

  // Show user message immediately
  setChatMessages(prev => [
    ...prev,
    { role: 'user', content: userMessage }
  ]);

  setChatLoading(true);

  try {
    const response = await axios.post(
      'https://rag-test-kabb.onrender.com/chat/',
      {
        msg: userMessage,
        k: 3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const botReply =
      response.data?.response ||
      'No response from assistant.';

    setChatMessages(prev => [
      ...prev,
      { role: 'assistant', content: botReply }
    ]);

  } catch (error) {
    console.error('Chat error:', error);

    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '⚠️ Unable to reach the study assistant right now.'
      }
    ]);
  } finally {
    setChatLoading(false);
  }
};

  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);
      const response = await axios.get('http://localhost:5000/api/pdfs');
      setNotes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSemesterClick = (sem) => {
    setSelectedSemester(sem);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      setUploadFile(file);
      setUploadError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadFile) {
      setUploadError('Please select a PDF file');
      return;
    }
    
    if (!uploadName.trim()) {
      setUploadError('Please provide a name for the notes');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadSuccess('');

      // const formData = new FormData();
      // formData.append('pdf', uploadFile);
      // formData.append('name', uploadName.trim());
      // if (user?.id) {
      //   formData.append('userId', user.id);
      // }

      // await axios.post('http://localhost:5000/api/pdfs', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });

      // setUploadSuccess('Notes uploaded successfully!');
      // setUploadFile(null);
      // setUploadName('');
      // fetchNotes(); // Refresh the notes list
      const buildNotesFormData = () => {
  const fd = new FormData();
  fd.append('pdf', uploadFile);          // for notes API
  fd.append('name', uploadName.trim());
  if (user?.id) fd.append('userId', user.id);
  return fd;
};

const buildIngestFormData = () => {
  const fd = new FormData();
  fd.append('file', uploadFile);         // 👈 IMPORTANT
  return fd;
};

try {
  setUploading(true);
  setUploadError('');
  setUploadSuccess('');

  // 1️⃣ Upload to notes backend
  await axios.post(
    'http://localhost:5000/api/pdfs',
    buildNotesFormData(),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  // 2️⃣ Upload to ingest (FastAPI RAG backend)
  await axios.post(
    'https://rag-test-kabb.onrender.com/ingest/pdf',
    buildIngestFormData(),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  setUploadSuccess('Notes uploaded and indexed successfully!');
  setUploadFile(null);
  setUploadName('');
  fetchNotes();

  setTimeout(() => {
    setShowUploadModal(false);
    setUploadSuccess('');
  }, 1500);

} catch (error) {
  console.error('Upload error:', error);

  if (error.response?.status === 422) {
    setUploadError('Invalid file format for ingest API');
  } else {
    setUploadError('Upload failed. Please try again.');
  }
} finally {
  setUploading(false);
}



      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload notes');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (noteName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/pdfs/${noteName}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${noteName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download the file');
    }
  };

  const handleDelete = async (noteName) => {
    if (!window.confirm(`Are you sure you want to delete "${noteName}"?`)) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/pdfs/${noteName}`);
      fetchNotes(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete the file');
    }
  };

  const academicYears = [
    '2025-2026',
    '2024-2025',
    '2023-2024',
    '2022-2023'
  ];

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'Electronics',
    'English'
  ];

  const notesTypes = [
    'Lecture Notes',
    'Assignment',
    'Lab Manual',
    'Question Bank',
    'Previous Year Papers'
  ];

  return (
    <div className="notes-page">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="notes-content">
        {/* Main Card */}
        <div className="notes-card">
          <div className="card-header">
            <h1 className="card-title">Notes Download</h1>
            <button 
              className="upload-btn"
              onClick={() => setShowUploadModal(true)}
            >
              + Upload Notes
            </button>
          </div>
          <div className="card-divider"></div>

          {/* Academic Year Dropdown */}
          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <select 
              className="form-select"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <option value="">Select</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Semester Selector */}
          <div className="form-group">
            <label className="form-label">Semester</label>
            <div className="semester-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <button
                  key={sem}
                  className={`semester-btn ${selectedSemester === sem ? 'selected' : ''}`}
                  onClick={() => handleSemesterClick(sem)}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>

          {/* Subject and Notes Type Dropdowns */}
          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">Subject</label>
              <select 
                className="form-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">Select</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group half">
              <label className="form-label">Notes Type</label>
              <select 
                className="form-select"
                value={notesType}
                onChange={(e) => setNotesType(e.target.value)}
              >
                <option value="">Select</option>
                {notesTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes List */}
          <div className="notes-list-section">
            <h3 className="section-title">Available Notes</h3>
            {loadingNotes ? (
              <div className="loading-text">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="empty-text">No notes available. Upload some notes to get started!</div>
            ) : (
              <div className="notes-list">
                {notes.map((note) => (
                  <div key={note._id} className="note-item">
                    <div className="note-info">
                      <span className="note-icon">📄</span>
                      <div className="note-details">
                        <span className="note-name">{note.name}</span>
                        <span className="note-meta">
                          {(note.size / 1024).toFixed(1)} KB • {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="note-actions">
                      <button 
                        className="action-btn download"
                        onClick={() => handleDownload(note.name)}
                      >
                        ⬇️ Download
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(note.name)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chatbot Panel */}
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span className="chatbot-icon">🤖</span>
            <h3>Study Assistant</h3>
          </div>
          
          <div className="chatbot-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-message assistant">
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <form className="chatbot-input-form" onSubmit={handleChatSubmit}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button 
              type="submit" 
              className="chatbot-send-btn"
              disabled={chatLoading || !chatInput.trim()}
            >
              ➤
            </button>
          </form>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Notes</h2>
              <button 
                className="close-btn"
                onClick={() => setShowUploadModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Notes Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter a unique name for the notes"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">PDF File *</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="file-label">
                      {uploadFile ? uploadFile.name : 'Choose PDF file (max 10MB)'}
                    </label>
                  </div>
                </div>

                {uploadError && (
                  <div className="error-message">{uploadError}</div>
                )}
                
                {uploadSuccess && (
                  <div className="success-message">{uploadSuccess}</div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesDashboard;
