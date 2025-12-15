import React, { useState } from 'react';
import emailjs from 'emailjs-com';

function ContactForm({ onNotification }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message
    };

    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_urtbt14';
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_8sfqyrn';
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'PTuqiFviGAOMEb1v5';

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      onNotification('Your message has been sent successfully!', 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      onNotification('Failed to send message. Please try again later.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <h1>Get In Touch</h1>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your.email@example.com"
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Your message here..."
            rows="5"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </section>
  );
}

export default ContactForm;
