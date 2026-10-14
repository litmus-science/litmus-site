/**
 * Supplier application form — submits to Formspree without leaving the page.
 * Falls back to a normal form POST if JavaScript is unavailable.
 */
(function () {
    const form = document.getElementById('suppliers-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const data = new FormData(form);
        const email = data.get('email');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: data
            });

            if (!response.ok) {
                throw new Error('Form submission failed');
            }

            if (window.posthog) {
                posthog.identify(email, { email, role: 'lab', lab_name: data.get('lab_name') });
            }

            const message = document.createElement('div');
            message.className = 'success-message';
            message.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; color: var(--base-teal); margin-bottom: 1rem;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h3 style="color: var(--white); font-size: 1.5rem; margin-bottom: 0.5rem;">Thanks — we'll be in touch soon.</h3>
                <p style="color: var(--gray-200);">Expect a reply to <strong></strong> within 1–2 business days.</p>
            `;
            message.querySelector('strong').textContent = email;
            form.replaceChildren(message);
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            alert('Something went wrong. Please try again or email hello@litmus.science.');
        }
    });
})();
