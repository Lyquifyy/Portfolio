import { render, screen } from '@testing-library/react';
import App from './App';
import { PROFILE, SECTIONS, PROJECTS } from './data/content';

describe('App', () => {
  it('renders the hero name', () => {
    render(<App />);
    // The hero splits the name across two masked words.
    expect(screen.getAllByText(PROFILE.firstName).length).toBeGreaterThan(0);
    expect(screen.getAllByText(PROFILE.lastName).length).toBeGreaterThan(0);
  });

  it('renders every section landmark', () => {
    const { container } = render(<App />);
    SECTIONS.forEach(({ id }) => {
      expect(container.querySelector(`#${id}`)).toBeInTheDocument();
    });
  });

  it('renders section navigation for each section', () => {
    render(<App />);
    SECTIONS.forEach(({ label }) => {
      expect(screen.getByRole('button', { name: `Go to ${label}` })).toBeInTheDocument();
    });
  });

  it('lists every project and shows the first one by default', () => {
    render(<App />);
    PROJECTS.forEach((p) => {
      expect(screen.getAllByText(p.title).length).toBeGreaterThan(0);
    });
    expect(screen.getByText(PROJECTS[0].description)).toBeInTheDocument();
  });

  it('renders the contact form', () => {
    render(<App />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });
});
