import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import Chatbot from './Chatbot';
import './Dashboard.css';

function Dashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start true to load initially
  const [error, setError] = useState('');

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      let response;
      if (user.role === 'patient') {
        response = await apiClient.get('/patient/appointments/');
      } else if (user.role === 'doctor') {
        response = await apiClient.get('/doctor/schedule/');
      } else {
        setAppointments([]); // Handle other roles or show a message
        setIsLoading(false);
        return;
      }

      if (response && response.data) {
        if (user.role === 'doctor' && response.data.appointments && Array.isArray(response.data.appointments)) {
            setAppointments(response.data.appointments);
        } else if (Array.isArray(response.data)) { // For direct array response
            setAppointments(response.data);
        } else if (response.data.results && Array.isArray(response.data.results)) { // For paginated response
             setAppointments(response.data.results);
        } else {
             setAppointments([]);
        }
      } else {
        setAppointments([]);
      }
    } catch (err) {
      setError('Failed to fetch appointments. Please try again later.');
      console.error("Fetch appointments error:", err.response || err.message || err);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!appointmentDate || !appointmentReason) {
        setFormError('Please fill in all fields.');
        return;
    }
    setIsSubmitting(true);
    try {
        await apiClient.post('/patient/appointments/', {
            appointment_date: appointmentDate,
            reason: appointmentReason,
        });
        setShowAppointmentForm(false);
        setAppointmentDate('');
        setAppointmentReason('');
        fetchAppointments(); // Refresh list
    } catch (err) {
        let errorMsg = 'Failed to book appointment.';
        if (err.response && err.response.data) {
            const backendErrors = err.response.data;
             if (backendErrors.detail) {
                errorMsg = backendErrors.detail;
            } else if (typeof backendErrors === 'object') {
                errorMsg = Object.entries(backendErrors)
                .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('\n');
            } else if (typeof backendErrors === 'string') {
                errorMsg = backendErrors;
            }
        } else if (err.message) {
            errorMsg = err.message;
        }
        setFormError(errorMsg);
        console.error("Book appointment error:", err.response || err.message || err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
        setIsSubmitting(true); // Can reuse this for general loading state on action
        try {
            await apiClient.patch(`/patient/appointments/${appointmentId}/`, { status: 'CANCELLED' });
            fetchAppointments();
        } catch (err) {
            alert('Failed to cancel appointment. ' + (err.response?.data?.detail || err.message || ''));
            console.error("Cancel appointment error:", err.response || err.message || err);
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  if (isLoading && appointments.length === 0) { // Show loading only on initial load or if list is empty
    return <div className="loading-dashboard">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome, {user?.username}! (Role: {user?.role})</p>
      </header>

      {user?.role === 'patient' && (
        <section className="dashboard-section">
          <button onClick={() => setShowAppointmentForm(!showAppointmentForm)} className="action-button toggle-form-button">
            {showAppointmentForm ? 'Close Appointment Form' : 'Book New Appointment'}
          </button>
          {showAppointmentForm && (
            <form onSubmit={handleBookAppointment} className="appointment-form">
              <h3>Book Appointment</h3>
              <div>
                <label htmlFor="apt-date">Date and Time:</label>
                <input
                  id="apt-date"
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="apt-reason">Reason:</label>
                <textarea
                  id="apt-reason"
                  value={appointmentReason}
                  onChange={(e) => setAppointmentReason(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows="3"
                />
              </div>
              {formError && <pre className="error-message form-error">{formError}</pre>}
              <button type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? 'Submitting...' : 'Submit Appointment'}
              </button>
            </form>
          )}
        </section>
      )}

      <section className="dashboard-section">
        <h2>Your Appointments / Schedule</h2>
        {isLoading && <p className="loading-inline">Refreshing appointments...</p>}
        {error && <p className="error-message">{error}</p>}
        {!isLoading && !error && appointments.length === 0 && <p>No appointments found.</p>}
        {!isLoading && !error && appointments.length > 0 && (
          <ul className="appointments-list">
            {appointments.map((apt) => (
              <li key={apt.id || apt.appointment_date} className={`appointment-item status-${apt.status?.toLowerCase()}`}>
                <div className="appointment-details">
                    <p><strong>Date:</strong> {new Date(apt.appointment_date || apt.date).toLocaleString()}</p>
                    {user?.role === 'doctor' && apt.patient_id && <p><strong>Patient ID:</strong> {apt.patient_id}</p>}
                    <p><strong>Reason:</strong> {apt.reason || 'N/A (Doctor View)'}</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${apt.status?.toLowerCase()}`}>{apt.status}</span></p>
                </div>
                {user?.role === 'patient' && (apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                    <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="cancel-button"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <Chatbot />
    </div>
  );
}

export default Dashboard;