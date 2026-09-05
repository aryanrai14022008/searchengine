'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Download,
  Search,
  Trash2,
  Eye,
  Lock,
  LogOut,
  Check,
  ExternalLink,
  Shield,
  X,
  RefreshCw,
  Phone,
  Copy,
  Calendar,
  Clock
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '@/lib/quizData';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard Data
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Check auth session on load
  useEffect(() => {
    checkAuth();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied: "${text}"`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setLoginError('Invalid access credentials. Please try again.');
      }
    } catch (err) {
      setLoginError('Login request failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const query = new URLSearchParams();
      if (searchQuery) query.set('search', searchQuery);
      if (typeFilter !== 'all') query.set('type', typeFilter);

      const res = await fetch(`/api/responses?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [searchQuery, typeFilter, isAuthenticated]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this candidate record?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/responses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(item => item._id !== id));
        fetchData();
        showToast('Candidate record deleted successfully');
      }
    } catch (err) {
      alert('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    if (!items.length) {
      alert('No candidates available to export.');
      return;
    }

    const headers = ['Type', 'Candidate Name', 'Email', 'Phone', 'Pass ID / Reference', 'Submission Date', 'Details / Answers'];
    const rows = items.map(item => {
      const isQuiz = item.type === 'quiz';
      const type = isQuiz ? 'Quiz Waitlist' : 'Inquiry';
      const name = `"${item.name || ''}"`;
      const email = `"${item.email || ''}"`;
      const phone = `"${item.phone || ''}"`;
      const passId = isQuiz ? (item.passId || '') : 'Direct Inquiry';
      const date = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
      const details = isQuiz 
        ? `"${Object.entries(item.answers || {}).map(([k, v]) => `${k}: ${v}`).join('; ')}"`
        : `"${(item.message || '').replace(/"/g, '""')}"`;

      return [type, name, email, phone, passId, `"${date}"`, details].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `humblbar_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully');
  };

  // Question lookup dictionary
  const questionMap = useMemo(() => {
    const map = {};
    QUIZ_QUESTIONS.forEach(q => {
      map[q.id] = q;
    });
    return map;
  }, []);

  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) return null;
    return `https://wa.me/${cleanDigits}`;
  };

  const getInitials = (name) => {
    if (!name) return 'HB';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <p className="admin-loading-text">Loading candidate records...</p>
      </div>
    );
  }

  // Login Screen (No default keys visible)
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-backdrop-glow" />
        
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-lock-badge">
              <Shield size={26} color="#F3B562" />
            </div>
            <h1 className="admin-login-title">Admin Portal</h1>
            <p className="admin-login-subtitle">
              Enter your secure admin key to view and manage candidate submissions.
            </p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-input-group">
              <label className="admin-label">Admin Security Key</label>
              <div className="admin-input-wrapper">
                <Lock size={18} className="admin-input-icon" />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter security key..."
                  className="admin-input"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <div className="admin-error-alert">
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="admin-btn-primary">
              <span>Sign In</span>
              <span>→</span>
            </button>
          </form>

          <div className="admin-login-footer">
            <Link href="/" className="admin-back-link">
              ← Return to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard: Candidate Details Only
  return (
    <div className="admin-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <Check size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-topbar-left">
            <div className="admin-logo-badge">HB</div>
            <div>
              <div className="admin-brand-name">
                HUMBLBAR <span className="admin-badge-tag">ADMIN</span>
              </div>
              <div className="admin-status-indicator">
                <span className="status-dot-pulse" />
                <span className="status-label">Live Database Connected</span>
              </div>
            </div>
          </div>

          <div className="admin-topbar-right">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="admin-btn-secondary"
              title="Refresh candidate data"
            >
              <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
              <span className="hide-mobile">{refreshing ? 'Refreshing...' : 'Sync Data'}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="admin-btn-secondary"
            >
              <span>Live Site</span>
              <ExternalLink size={14} />
            </Link>

            <button
              onClick={handleLogout}
              className="admin-btn-logout"
            >
              <LogOut size={15} />
              <span className="hide-mobile">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="admin-container">
        {/* Simple Clean Header Bar */}
        <section className="admin-welcome-bar">
          <div>
            <h1 className="admin-page-title">Candidate Details</h1>
            <p className="admin-page-sub">
              All submitted quiz candidates and contacts stored permanently in cloud MongoDB.
            </p>
          </div>
          <div className="admin-export-action">
            <button onClick={exportCSV} className="admin-btn-gold">
              <Download size={16} />
              <span>Export CSV ({items.length})</span>
            </button>
          </div>
        </section>

        {/* Controls, Search & Filter Bar */}
        <section className="admin-table-section">
          <div className="admin-filter-toolbar">
            <div className="toolbar-left">
              <div className="admin-search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search candidate by name, email, phone, pass ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-field"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="filter-chips-group">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`filter-chip ${typeFilter === 'all' ? 'active' : ''}`}
                >
                  All ({items.length})
                </button>
                <button
                  onClick={() => setTypeFilter('quiz')}
                  className={`filter-chip ${typeFilter === 'quiz' ? 'active' : ''}`}
                >
                  Quiz Candidates
                </button>
                <button
                  onClick={() => setTypeFilter('contact')}
                  className={`filter-chip ${typeFilter === 'contact' ? 'active' : ''}`}
                >
                  Inquiries
                </button>
              </div>
            </div>

            <div className="toolbar-right">
              <span className="results-count-pill">
                Total: {items.length} {items.length === 1 ? 'candidate' : 'candidates'}
              </span>
            </div>
          </div>

          {/* Candidates Submissions Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>CANDIDATE</th>
                  <th>CONTACT DETAILS</th>
                  <th>TYPE</th>
                  <th>PASS / REF ID</th>
                  <th>SUBMITTED</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty-cell">
                      <div className="empty-state-wrap">
                        <Users size={36} color="rgba(255, 255, 255, 0.2)" />
                        <p className="empty-title">No candidates found</p>
                        <p className="empty-desc">
                          {searchQuery
                            ? `No records matching "${searchQuery}".`
                            : 'Candidate submissions will appear here after attempting the quiz.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isQuiz = item.type === 'quiz';
                    const waLink = getWhatsAppLink(item.phone);
                    const formattedDate = item.createdAt 
                      ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Recent';
                    const formattedTime = item.createdAt
                      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <tr key={item._id} className="table-row-hover">
                        {/* Candidate Profile */}
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              {getInitials(item.name)}
                            </div>
                            <div>
                              <div className="customer-name">{item.name || 'Anonymous'}</div>
                              <div className="customer-id-sub">ID: {item._id ? item._id.slice(-8) : 'N/A'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info with Copy & WhatsApp */}
                        <td>
                          <div className="contact-cell">
                            <div className="contact-row">
                              <span className="contact-email">{item.email}</span>
                              <button
                                onClick={() => copyToClipboard(item.email, `email-${item._id}`)}
                                className="copy-mini-btn"
                                title="Copy Email"
                              >
                                {copiedId === `email-${item._id}` ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                              </button>
                            </div>
                            {item.phone && (
                              <div className="contact-row" style={{ marginTop: '4px' }}>
                                <span className="contact-phone">
                                  <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                  {item.phone}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(item.phone, `phone-${item._id}`)}
                                  className="copy-mini-btn"
                                  title="Copy Phone"
                                >
                                  {copiedId === `phone-${item._id}` ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                                </button>
                                {waLink && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="whatsapp-badge-link"
                                    title="Open WhatsApp chat"
                                  >
                                    WA
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Type */}
                        <td>
                          <span className={`source-type-pill ${isQuiz ? 'quiz-type' : 'contact-type'}`}>
                            {isQuiz ? 'Quiz Candidate' : 'Direct Inquiry'}
                          </span>
                        </td>

                        {/* Pass ID */}
                        <td>
                          <span className="pass-code-pill">
                            {item.passId || 'VIP-ENTRY'}
                          </span>
                        </td>

                        {/* Submission Time */}
                        <td>
                          <div className="date-time-cell">
                            <span className="date-text">
                              <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              {formattedDate}
                            </span>
                            <span className="time-text">
                              <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                              {formattedTime}
                            </span>
                          </div>
                        </td>

                        {/* Actions: View & Delete */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell">
                            <button
                              onClick={() => setSelectedResponse(item)}
                              className="action-btn-inspect"
                              title="Inspect Candidate Answers"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deletingId === item._id}
                              className="action-btn-delete"
                              title="Delete candidate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Candidate Details Modal */}
      {selectedResponse && (
        <div className="admin-modal-overlay" onClick={() => setSelectedResponse(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="customer-avatar large">
                  {getInitials(selectedResponse.name)}
                </div>
                <div>
                  <h2 className="modal-customer-name">{selectedResponse.name}</h2>
                  <p className="modal-customer-sub">
                    Submitted on {new Date(selectedResponse.createdAt).toLocaleString()} &bull; Pass: {selectedResponse.passId || 'N/A'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Contact Information */}
              <div className="modal-section">
                <h3 className="modal-section-title">Contact Information</h3>
                <div className="modal-contact-grid">
                  <div className="modal-info-box">
                    <span className="info-box-label">Email Address</span>
                    <div className="info-box-val-row">
                      <span className="info-box-val">{selectedResponse.email}</span>
                      <button
                        onClick={() => copyToClipboard(selectedResponse.email, 'modal-email')}
                        className="copy-mini-btn"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="modal-info-box">
                    <span className="info-box-label">Phone Number</span>
                    <div className="info-box-val-row">
                      <span className="info-box-val">{selectedResponse.phone || 'Not provided'}</span>
                      {selectedResponse.phone && (
                        <>
                          <button
                            onClick={() => copyToClipboard(selectedResponse.phone, 'modal-phone')}
                            className="copy-mini-btn"
                          >
                            <Copy size={13} />
                          </button>
                          {getWhatsAppLink(selectedResponse.phone) && (
                            <a
                              href={getWhatsAppLink(selectedResponse.phone)}
                              target="_blank"
                              rel="noreferrer"
                              className="whatsapp-badge-link"
                            >
                              WhatsApp
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Answers / Details */}
              <div className="modal-section" style={{ marginTop: '20px' }}>
                <h3 className="modal-section-title">
                  {selectedResponse.type === 'quiz' ? 'Quiz Responses' : 'Inquiry Message'}
                </h3>

                {selectedResponse.type === 'quiz' && selectedResponse.answers ? (
                  <div className="modal-answers-list">
                    {Object.entries(selectedResponse.answers).map(([key, val]) => {
                      const qMeta = questionMap[key];
                      const matchedOpt = qMeta?.options?.find(o => o.val === val);
                      const displayVal = matchedOpt ? matchedOpt.label : String(val);
                      return (
                        <div key={key} className="modal-answer-item">
                          <div className="answer-question-text">
                            {qMeta ? qMeta.question : key}
                          </div>
                          <div className="answer-value-badge">
                            {displayVal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="modal-message-box">
                    <p>{selectedResponse.message || 'No additional message provided.'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedResponse(null)}
                className="admin-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
