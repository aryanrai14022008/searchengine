'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Heart,
  HelpCircle,
  Mail,
  Download,
  Search,
  Trash2,
  Eye,
  Lock,
  LogOut,
  CheckCircle,
  ExternalLink,
  Shield,
  Filter,
  X,
  RefreshCw,
  Phone,
  MessageSquare,
  Copy,
  Check,
  Award,
  Sparkles,
  PieChart,
  Calendar,
  Clock,
  Send
} from 'lucide-react';
import { QUIZ_QUESTIONS, ARCHETYPES } from '@/lib/quizData';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard Data
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
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
        setLoginError(data.error || 'Invalid password. Try "admin123"');
      }
    } catch (err) {
      setLoginError('Login request failed');
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
        setMetrics(data.metrics || null);
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
    if (!confirm('Are you sure you want to permanently delete this submission?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/responses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(item => item._id !== id));
        fetchData();
        showToast('Lead deleted successfully');
      }
    } catch (err) {
      alert('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  // Archetype distribution calculation
  const archetypeDistribution = useMemo(() => {
    const quizItems = items.filter(i => i.type === 'quiz');
    const total = quizItems.length;
    if (total === 0) return [];

    const counts = {};
    ARCHETYPES.forEach(arch => {
      counts[arch.id] = { ...arch, count: 0 };
    });

    quizItems.forEach(item => {
      const archId = item.archetype?.id;
      if (archId && counts[archId]) {
        counts[archId].count += 1;
      } else {
        // match by title or fallback to first
        const matched = ARCHETYPES.find(a => a.title === item.archetype?.title);
        if (matched && counts[matched.id]) {
          counts[matched.id].count += 1;
        }
      }
    });

    return Object.values(counts).map(a => ({
      ...a,
      percentage: Math.round((a.count / total) * 100)
    }));
  }, [items]);

  const exportCSV = () => {
    if (!items.length) {
      alert('No leads available to export.');
      return;
    }

    const headers = ['Type', 'Customer Name', 'Email', 'Phone', 'Pass ID / Category', 'Snack Archetype / Subject', 'Submission Date', 'Details / Answers'];
    const rows = items.map(item => {
      const isQuiz = item.type === 'quiz';
      const type = isQuiz ? 'Quiz Waitlist' : 'Wholesale / Contact';
      const name = `"${item.name || ''}"`;
      const email = `"${item.email || ''}"`;
      const phone = `"${item.phone || ''}"`;
      const passId = isQuiz ? (item.passId || '') : 'Direct Inquiry';
      const archetype = isQuiz ? (item.archetype?.title || 'Power Strategist') : (item.subject || '');
      const date = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
      const details = isQuiz 
        ? `"${Object.entries(item.answers || {}).map(([k, v]) => `${k}: ${v}`).join('; ')}"`
        : `"${(item.message || '').replace(/"/g, '""')}"`;

      return [type, name, email, phone, passId, `"${archetype}"`, `"${date}"`, details].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `humblbar_leads_${new Date().toISOString().slice(0, 10)}.csv`);
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

  // Format phone for direct WhatsApp link
  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) return null;
    return `https://wa.me/${cleanDigits}`;
  };

  // Helper for initials
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
        <p className="admin-loading-text">Initializing HumblBar Control Hub...</p>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-backdrop-glow" />
        
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-lock-badge">
              <Shield size={28} color="#F3B562" />
            </div>
            <h1 className="admin-login-title">Client Admin Portal</h1>
            <p className="admin-login-subtitle">
              Confidential control hub for HumblBar founding leads & customer quiz profiles.
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
                  placeholder="Enter access password..."
                  className="admin-input"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <div className="admin-error-alert">
                <span>⚠️ {loginError}</span>
              </div>
            )}

            <button type="submit" className="admin-btn-primary">
              <span>Unlock Executive Portal</span>
              <span>→</span>
            </button>
          </form>

          <div className="admin-login-footer">
            <div className="admin-key-hint">
              <span>Default key: <code>admin123</code></span>
            </div>
            <Link href="/" className="admin-back-link">
              ← Return to live website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
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
                HUMBLBAR <span className="admin-badge-tag">EXECUTIVE HUB</span>
              </div>
              <div className="admin-status-indicator">
                <span className="status-dot-pulse" />
                <span className="status-label">Live Lead Engine Active</span>
              </div>
            </div>
          </div>

          <div className="admin-topbar-right">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="admin-btn-secondary"
              title="Refresh leads data"
            >
              <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
              <span className="hide-mobile">{refreshing ? 'Updating...' : 'Sync Data'}</span>
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
        {/* Welcome Section */}
        <section className="admin-welcome-bar">
          <div>
            <h1 className="admin-page-title">Executive Overview</h1>
            <p className="admin-page-sub">
              Real-time customer waitlist, computed snack archetypes, and pledged meals impact tracker.
            </p>
          </div>
          <div className="admin-export-action">
            <button onClick={exportCSV} className="admin-btn-gold">
              <Download size={16} />
              <span>Export CSV ({items.length} Leads)</span>
            </button>
          </div>
        </section>

        {/* 4 Stat KPI Cards */}
        <section className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="kpi-icon-wrap" style={{ background: 'rgba(200, 117, 86, 0.15)', color: '#C87556' }}>
              <Users size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">TOTAL CUSTOMER LEADS</span>
              <div className="kpi-number">{metrics?.totalWaitlistCount ?? items.length}</div>
              <div className="kpi-subtext positive">
                <span>↑ 100% Organic Founders</span>
              </div>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171' }}>
              <Heart size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">MEALS PLEDGED TO CHARITY</span>
              <div className="kpi-number" style={{ color: '#F87171' }}>
                {metrics?.totalMealsPledged ?? items.filter(i => i.type === 'quiz').length}
              </div>
              <div className="kpi-subtext">
                <span>1 Bar = 1 Meal per signup</span>
              </div>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-wrap" style={{ background: 'rgba(243, 181, 98, 0.15)', color: '#F3B562' }}>
              <Sparkles size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">SNACK DNA QUIZZES</span>
              <div className="kpi-number">{metrics?.totalQuizResponses ?? items.filter(i => i.type === 'quiz').length}</div>
              <div className="kpi-subtext positive">
                <span>Completed 8-Question Profiles</span>
              </div>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
              <Mail size={22} />
            </div>
            <div className="kpi-content">
              <span className="kpi-title">WHOLESALE / INQUIRIES</span>
              <div className="kpi-number">{metrics?.totalContacts ?? items.filter(i => i.type === 'contact').length}</div>
              <div className="kpi-subtext">
                <span>Direct Partner Messages</span>
              </div>
            </div>
          </div>
        </section>

        {/* Archetype Breakdown Progress Cards */}
        {archetypeDistribution.length > 0 && (
          <section className="admin-archetype-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <PieChart size={18} color="#F3B562" />
                <h2 className="panel-title">Customer Flavor & Craving Archetype Distribution</h2>
              </div>
              <span className="panel-badge">{items.filter(i => i.type === 'quiz').length} Completed Quizzes</span>
            </div>

            <div className="archetype-bar-grid">
              {archetypeDistribution.map((arch) => (
                <div key={arch.id} className="archetype-stat-box">
                  <div className="arch-stat-top">
                    <span className="arch-stat-name">{arch.title}</span>
                    <span className="arch-stat-count">{arch.count} ({arch.percentage}%)</span>
                  </div>
                  <div className="arch-progress-track">
                    <div
                      className="arch-progress-fill"
                      style={{
                        width: `${Math.max(arch.percentage, 4)}%`,
                        background: arch.tagColor || 'linear-gradient(90deg, #C87556, #F3B562)'
                      }}
                    />
                  </div>
                  <div className="arch-stat-sub">
                    <span>{arch.name}</span>
                    <span>Score: {arch.cleanLabelScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Controls, Search & Filter Bar */}
        <section className="admin-table-section">
          <div className="admin-filter-toolbar">
            <div className="toolbar-left">
              <div className="admin-search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, phone, pass ID..."
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
                  Quiz Waitlist
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
                Showing {items.length} {items.length === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>CONTACT DETAILS</th>
                  <th>SOURCE & TYPE</th>
                  <th>SNACK ARCHETYPE / TOPIC</th>
                  <th>PASS / REF ID</th>
                  <th>SUBMITTED</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty-cell">
                      <div className="empty-state-wrap">
                        <Users size={36} color="rgba(255, 255, 255, 0.2)" />
                        <p className="empty-title">No submissions found</p>
                        <p className="empty-desc">
                          {searchQuery
                            ? `No records matching "${searchQuery}". Try clearing your search.`
                            : 'New leads will automatically appear here when customers complete the Snack DNA quiz.'}
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
                        {/* Customer Profile */}
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              {getInitials(item.name)}
                            </div>
                            <div>
                              <div className="customer-name">{item.name || 'Anonymous User'}</div>
                              <div className="customer-id-sub">Lead ID: {item._id.slice(-6)}</div>
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
                              <div className="contact-row">
                                <span className="contact-phone">{item.phone}</span>
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
                                    className="whatsapp-mini-btn"
                                    title="Open WhatsApp Chat"
                                  >
                                    <MessageSquare size={12} />
                                    <span>WA</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Source Type Badge */}
                        <td>
                          {isQuiz ? (
                            <span className="lead-pill pill-quiz">
                              <Sparkles size={12} />
                              <span>Quiz Waitlist</span>
                            </span>
                          ) : (
                            <span className="lead-pill pill-contact">
                              <Mail size={12} />
                              <span>Wholesale</span>
                            </span>
                          )}
                        </td>

                        {/* Archetype / Subject */}
                        <td>
                          {isQuiz ? (
                            <div className="archetype-cell">
                              <span className="arch-tag-pill">
                                {item.archetype?.title || 'Power Strategist'}
                              </span>
                            </div>
                          ) : (
                            <div className="subject-cell" title={item.subject}>
                              {item.subject || 'Direct Inquiry'}
                            </div>
                          )}
                        </td>

                        {/* Pass ID */}
                        <td>
                          {isQuiz ? (
                            <span className="pass-id-badge">
                              {item.passId || item.queueNumber || '#0100'}
                            </span>
                          ) : (
                            <span className="text-subtle-mono">Direct Form</span>
                          )}
                        </td>

                        {/* Date */}
                        <td>
                          <div className="date-cell">
                            <span className="date-main">{formattedDate}</span>
                            <span className="date-time">{formattedTime}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-cell">
                            <button
                              onClick={() => setSelectedResponse(item)}
                              className="btn-action-view"
                              title="Inspect full questionnaire answers"
                            >
                              <Eye size={14} />
                              <span>Inspect</span>
                            </button>

                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deletingId === item._id}
                              className="btn-action-delete"
                              title="Delete submission"
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

      {/* Detail Inspector Modal */}
      {selectedResponse && (
        <div className="admin-modal-overlay" onClick={() => setSelectedResponse(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-top">
              <div className="modal-customer-info">
                <div className="customer-avatar large">
                  {getInitials(selectedResponse.name)}
                </div>
                <div>
                  <h3 className="modal-title">{selectedResponse.name}</h3>
                  <div className="modal-meta-pills">
                    <span className="meta-pill">{selectedResponse.email}</span>
                    {selectedResponse.phone && <span className="meta-pill">{selectedResponse.phone}</span>}
                    <span className="meta-pill">
                      {new Date(selectedResponse.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedResponse(null)}
                className="modal-close-btn"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body-scroll">
              {selectedResponse.type === 'quiz' ? (
                <>
                  {/* Archetype Profile Card */}
                  <div className="modal-archetype-card">
                    <div className="modal-arch-header">
                      <Award size={20} color="#F3B562" />
                      <div>
                        <div className="modal-arch-badge">COMPUTED SNACK ARCHETYPE</div>
                        <h4 className="modal-arch-title">
                          {selectedResponse.archetype?.title || 'THE 4PM POWER STRATEGIST'}
                        </h4>
                      </div>
                    </div>
                    <p className="modal-arch-desc">
                      {selectedResponse.archetype?.description ||
                        'Prefers balanced clean fuel to sustain focus and avoid afternoon crashes.'}
                    </p>
                    <div className="modal-arch-metrics">
                      <div>
                        <span>Protein Need</span>
                        <strong>{selectedResponse.archetype?.proteinNeed || 'High Focus'}</strong>
                      </div>
                      <div>
                        <span>Peak Craving Window</span>
                        <strong>{selectedResponse.archetype?.cravingTime || '4:00 PM'}</strong>
                      </div>
                      <div>
                        <span>Clean Score</span>
                        <strong style={{ color: '#10B981' }}>{selectedResponse.archetype?.cleanLabelScore || '98%'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Answers Questionnaire View */}
                  <div className="modal-answers-section">
                    <h4 className="section-subtitle">
                      <span>Quiz Questionnaire Responses</span>
                      <span className="count-tag">{Object.keys(selectedResponse.answers || {}).length} Questions</span>
                    </h4>

                    <div className="qa-cards-list">
                      {QUIZ_QUESTIONS.map((q, idx) => {
                        const userVal = selectedResponse.answers?.[q.id];
                        return (
                          <div key={q.id} className="qa-item-card">
                            <div className="qa-item-header">
                              <span className="qa-cat">{q.category}</span>
                              <span className="qa-step">Step {idx + 1} of 8</span>
                            </div>
                            <div className="qa-question">{q.question}</div>
                            <div className="qa-user-answer">
                              <span className="ans-label">Selected Option:</span>
                              <strong className="ans-value">{userVal || 'Not answered'}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* Contact Message View */
                <div className="modal-contact-section">
                  <div className="contact-subject-box">
                    <span className="subject-label">Subject Topic:</span>
                    <h4 className="subject-text">{selectedResponse.subject}</h4>
                  </div>

                  <div className="contact-message-box">
                    <span className="message-label">Customer Message:</span>
                    <p className="message-text">{selectedResponse.message}</p>
                  </div>

                  <div className="contact-actions-footer">
                    <a
                      href={`mailto:${selectedResponse.email}?subject=Re: ${encodeURIComponent(selectedResponse.subject || 'HumblBar Partnership')}`}
                      className="admin-btn-gold"
                    >
                      <Send size={16} />
                      <span>Reply via Email ({selectedResponse.email})</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div className="modal-bottom-bar">
              {selectedResponse.phone && getWhatsAppLink(selectedResponse.phone) && (
                <a
                  href={getWhatsAppLink(selectedResponse.phone)}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn-secondary"
                  style={{ gap: '8px' }}
                >
                  <MessageSquare size={16} color="#22C55E" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="admin-btn-primary"
                style={{ marginLeft: 'auto', width: 'auto', padding: '10px 24px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
