document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Listings filter (listings.html only)
  const filterForm = document.querySelector('.filter-bar');
  const cards = document.querySelectorAll('[data-listing]');
  const resultsCount = document.querySelector('.results-count');

  function applyFilters() {
    if (!filterForm || !cards.length) return;
    const type = filterForm.querySelector('[name="type"]').value;
    const beds = filterForm.querySelector('[name="beds"]').value;
    const price = filterForm.querySelector('[name="price"]').value;
    const q = filterForm.querySelector('[name="q"]').value.trim().toLowerCase();

    let visible = 0;
    cards.forEach(card => {
      const dType = card.dataset.type;
      const dBeds = Number(card.dataset.beds);
      const dPrice = Number(card.dataset.price);
      const dLoc = card.dataset.location.toLowerCase();

      let match = true;
      if (type && type !== dType) match = false;
      if (beds && dBeds < Number(beds)) match = false;
      if (price && dPrice > Number(price)) match = false;
      if (q && !dLoc.includes(q)) match = false;

      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    if (resultsCount) {
      resultsCount.textContent = `${visible} propert${visible === 1 ? 'y' : 'ies'} found`;
    }
  }

  if (filterForm) {
    filterForm.addEventListener('input', applyFilters);
    filterForm.addEventListener('change', applyFilters);
    applyFilters();
  }

  // Show property valuation fields only when relevant
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const reason = contactForm.querySelector('[name="reason"]');
    const valuationFields = contactForm.querySelectorAll('[data-valuation-fields]');
    function toggleValuationFields() {
      const show = reason && reason.value === 'Free valuation';
      valuationFields.forEach(el => { el.style.display = show ? '' : 'none'; });
    }
    if (reason) {
      reason.addEventListener('change', toggleValuationFields);
      toggleValuationFields();
    }

    // After a successful send (legacy non-JS redirect path), FormSubmit sends back ?sent=true
    if (new URLSearchParams(location.search).get('sent') === 'true') {
      const msg = contactForm.querySelector('.form-status');
      if (msg) { msg.textContent = 'Thanks — your enquiry has been sent. James will be in touch shortly.'; msg.style.color = 'var(--gold)'; }
    }

    // Submit via AJAX so a blocked/failed send shows a clear message instead of doing nothing
    const statusEl = contactForm.querySelector('.form-status');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!statusEl || !submitBtn) { contactForm.submit(); return; }

      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      statusEl.style.color = 'var(--navy)';
      statusEl.textContent = 'Sending your enquiry…';

      const data = new FormData(contactForm);
      fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      .then(res => {
        if (!res.ok) throw new Error('Server responded with ' + res.status);
        return res.json().catch(() => ({}));
      })
      .then(() => {
        statusEl.style.color = 'var(--gold)';
        statusEl.textContent = 'Thanks — your enquiry has been sent. James will be in touch shortly.';
        contactForm.reset();
        if (reason) toggleValuationFields();
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      })
      .catch(err => {
        console.error('Contact form send failed:', err);
        statusEl.style.color = '#b23b3b';
        statusEl.innerHTML = 'Sorry, something blocked that enquiry from sending (often a browser ad-blocker or privacy extension). Please try again, or email <a href="mailto:james.quigg@quiggproperty.com" style="color:#b23b3b; text-decoration:underline;">james.quigg@quiggproperty.com</a> or call <a href="tel:+353833820623" style="color:#b23b3b; text-decoration:underline;">083 382 0623</a> directly.';
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
    });

    // Fast-track 60-second valuation flow: ?valuation=1 pre-fills and jumps to the form
    if (new URLSearchParams(location.search).get('valuation') === '1') {
      if (reason) {
        reason.value = 'Free valuation';
        toggleValuationFields();
      }
      const heading = document.querySelector('.contact-form-heading');
      const subtext = document.querySelector('.contact-form-subtext');
      if (heading) heading.textContent = 'Get Your 60-Second Valuation';
      if (subtext) subtext.textContent = 'Just the key details — takes about 60 seconds. James will value your property personally and get back to you within one business day.';

      const wrapper = document.getElementById('valuation-form');
      if (wrapper) {
        let badge = wrapper.querySelector('.valuation-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'valuation-badge';
          badge.textContent = '⚡ 60-Second Valuation';
          badge.style.cssText = 'display:inline-block; background:var(--gold); color:var(--navy); font-weight:700; font-size:0.78rem; letter-spacing:0.05em; text-transform:uppercase; padding:6px 14px; border-radius:999px; margin-bottom:12px;';
          wrapper.insertBefore(badge, wrapper.firstChild);
        }
      }

      window.requestAnimationFrame(() => {
        const target = document.getElementById('valuation-form');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
});
