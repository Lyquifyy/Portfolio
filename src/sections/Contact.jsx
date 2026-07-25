import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import emailjs from 'emailjs-com';
import SectionHeader from '../components/SectionHeader';
import SpotlightCard from '../components/SpotlightCard';
import MagneticButton from '../components/MagneticButton';
import { EMAILJS } from '../data/content';
import { EASE_OUT } from '../motion/variants';

const EMPTY = { name: '', email: '', message: '' };

export default function Contact() {
  const [formData, setFormData] = useState(EMPTY);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const update = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setStatus('');

    emailjs
      .send(
        EMAILJS.serviceId,
        EMAILJS.templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        EMAILJS.publicKey
      )
      .then(() => {
        setStatus('success');
        setFormData(EMPTY);
      })
      .catch(() => setStatus('error'))
      .finally(() => setSending(false));
  };

  return (
    <section id="contact" className="section">
      <div className="section__inner section__inner--narrow">
        <SectionHeader num="07" title="Get In Touch" />

        <p className="section__intro">
          Have a project in mind, a question, or just want to connect? I&apos;d love to hear from you.
        </p>

        <SpotlightCard as="div" tilt={false} className="contact__card">
          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={update('name')}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={update('email')}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={update('message')}
                required
              />
            </div>

            <MagneticButton variant="primary" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send Message'}
            </MagneticButton>

            <div className="form-status-slot" aria-live="polite">
              <AnimatePresence mode="wait">
                {status && (
                  <motion.p
                    key={status}
                    className={`form-status form-status--${status}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                  >
                    {status === 'success'
                      ? "Message sent! I'll be in touch soon."
                      : 'Something went wrong. Please try again.'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </SpotlightCard>
      </div>
    </section>
  );
}
