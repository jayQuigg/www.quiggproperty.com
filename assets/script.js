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

    // Send via the visitor's own email app (mailto:) instead of a third-party form
    // backend. This has no server dependency at all — formsubmit.co kept hanging/
    // failing during testing (possibly rate-limited from repeated test sends), so
    // this removes that point of failure entirely and is guaranteed to work as long
    // as the visitor has a default mail app, which almost everyone does.
    const statusEl = contactForm.querySelector('.form-status');
    contactForm.addEventListener('submit', (e) => {
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return; // let the browser show its native required-field prompts
      }
      e.preventDefault();

      const val = (name) => {
        const field = contactForm.querySelector(`[name="${name}"]`);
        return field ? field.value.trim() : '';
      };

      const lines = [
        `Name: ${val('name')}`,
        `Email: ${val('email')}`,
        `Phone: ${val('phone')}`,
        `Interested in: ${val('reason')}`
      ];
      if (val('reason') === 'Free valuation') {
        lines.push(
          `Property address: ${val('prop_address')}`,
          `Property type: ${val('prop_type')}`,
          `Approx. bedrooms: ${val('prop_beds')}`,
          `Approx. size (sqm): ${val('prop_size')}`
        );
      }
      lines.push('', 'Message:', val('message') || '(none)');

      const subject = encodeURIComponent('New website enquiry — Quigg Property');
      const body = encodeURIComponent(lines.join('\n'));
      window.location.href = `mailto:james.quigg@quiggproperty.com?subject=${subject}&body=${body}`;

      if (statusEl) {
        statusEl.style.color = 'var(--gold)';
        statusEl.textContent = 'Your email app should now be open with your enquiry ready to send — just hit send there. If nothing opened, please email james.quigg@quiggproperty.com or call 083 382 0623 directly.';
      }
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
