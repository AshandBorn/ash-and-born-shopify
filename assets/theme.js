
document.addEventListener('DOMContentLoaded',()=>{
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('section-visible');obs.unobserve(e.target)}}),{threshold:.15});
  document.querySelectorAll('.section-animate').forEach(el=>obs.observe(el));
});
