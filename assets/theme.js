// JavaScript for Ash & Born enhanced interactions
// Fade-in sections on scroll using Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.section-animate').forEach(section => {
    observer.observe(section);
  });
});