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
  document.querySelectorAll('[data-mailto]').forEach(form => {
    const reason = form.querySelector('[name="reason"]');
    const valuationFields = form.querySelectorAll('[data-valuation-fields]');
    function toggleValuationFields() {
      const show = reason && reason.value === 'Free valuation';
      valuationFields.forEach(el => { el.style.display = show ? '' : 'none'; });
    }
    if (reason) {
      reason.addEventListener('change', toggleValuationFields);
      toggleValuationFields();
    }
  });

  // Contact / enquiry forms: build a real email via mailto (no backend needed for this static site)
  document.querySelectorAll('form[data-mailto]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const to = form.dataset.mailto;
      const get = (name) => {
        const el = form.querySelector(`[name="${name}"]`);
        return el ? el.value.trim() : '';
      };
      const reason = get('reason') || 'General enquiry';
      const subject = `Website Enquiry — ${reason}`;
      const lines = [
        `Name: ${get('name')}`,
        `Email: ${get('email')}`,
        `Phone: ${get('phone')}`,
        `Interested in: ${reason}`
      ];
      if (get('prop_address')) lines.push(`Property address: ${get('prop_address')}`);
      if (get('prop_type')) lines.push(`Property type: ${get('prop_type')}`);
      if (get('prop_beds')) lines.push(`Approx. bedrooms: ${get('prop_beds')}`);
      if (get('prop_size')) lines.push(`Approx. size: ${get('prop_size')} sqm`);
      lines.push('', 'Message:', get('message') || '(none)');
      const body = lines.join('\n');
      const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const msg = form.querySelector('.form-status');
      if (msg) msg.textContent = 'Opening your email app to send this to James — just hit Send.';
      window.location.href = mailtoUrl;
    });
  });

  // Search/filter forms with no backend: prevent a no-op page reload on submit
  document.querySelectorAll('form[data-static]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.querySelector('.form-status');
      if (msg) msg.textContent = 'Thanks — your enquiry has been noted. James will be in touch shortly.';
    });
  });
});
