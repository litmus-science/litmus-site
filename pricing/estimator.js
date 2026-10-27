/**
 * Arrayed binding price estimator.
 *
 * Reads final customer prices from arrayed-prices.json, which is generated from a
 * private config outside this repo (lab costs and markup never ship to the client).
 * TODO: replace the static table with a server endpoint that returns the estimate.
 */
(function () {
    const root = document.getElementById('arrayed-estimator');
    if (!root) return;

    const slider = root.querySelector('#estimator-designs');
    const count = root.querySelector('#estimator-count');
    const sourceButtons = root.querySelectorAll('[data-source]');
    const totalEl = root.querySelector('[data-estimate-total]');
    const perEl = root.querySelector('[data-estimate-per]');
    const turnaroundEl = root.querySelector('[data-estimate-turnaround]');

    const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    let table = null;
    let sourceTarget = false;

    function clamp(n) {
        if (!table) return n;
        return Math.min(table.max, Math.max(table.min, Math.round(n) || table.min));
    }

    function render() {
        if (!table) return;
        const n = clamp(Number(slider.value));
        const total = table.supplied[n - table.min] + (sourceTarget ? table.sourcingAddOn : 0);
        const band = table.turnaround.find((b) => n <= b.upTo);

        totalEl.textContent = money.format(total);
        perEl.textContent = `≈ ${money.format(Math.round(total / n))} / design`;
        turnaroundEl.textContent = `Turnaround ${band.text}${sourceTarget ? ' from target arrival' : ''}`;
        slider.style.setProperty('--fill', `${((n - table.min) / (table.max - table.min)) * 100}%`);
    }

    slider.addEventListener('input', () => {
        count.value = slider.value;
        render();
    });

    count.addEventListener('input', () => {
        if (count.value === '') return;
        slider.value = clamp(Number(count.value));
        render();
    });

    count.addEventListener('change', () => {
        count.value = slider.value;
    });

    sourceButtons.forEach((button) => {
        button.addEventListener('click', () => {
            sourceTarget = button.dataset.source === 'litmus';
            sourceButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
            render();
        });
    });

    fetch(new URL('arrayed-prices.json', document.currentScript?.src ?? location.href))
        .then((response) => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            table = data;
            root.classList.add('is-ready');
            render();
        })
        .catch(() => {
            totalEl.textContent = 'Quoted';
            perEl.textContent = 'Live estimate unavailable — request a quote.';
            turnaroundEl.textContent = '';
        });
})();
