/**
 * Arrayed binding price estimator.
 *
 * Reads final customer prices from arrayed-prices.json, which is generated from a
 * private config outside this repo (lab costs and markup never ship to the client).
 * TODO: replace the static table with a server endpoint that returns the estimate.
 *
 * Table layout (values in units of `unit` dollars):
 * prices[readout][targets - 1][fast ? 1 : 0][sourcing ? 1 : 0][designs - min],
 * addOn[readout][targets - 1][fast ? 1 : 0][designs - min] (sourcing add-on included in the total),
 * fast[readout][targets - 1][designs - min] = 1 when fast synthesis is available for that order.
 */
(function () {
    const root = document.getElementById('arrayed-estimator');
    if (!root) return;

    const slider = root.querySelector('#estimator-designs');
    const count = root.querySelector('#estimator-count');
    const targetButtons = root.querySelectorAll('[data-targets]');
    const readoutButtons = root.querySelectorAll('[data-readout]');
    const speedButtons = root.querySelectorAll('[data-speed]');
    const sourceButtons = root.querySelectorAll('[data-source]');
    const totalEl = root.querySelector('[data-estimate-total]');
    const perEl = root.querySelector('[data-estimate-per]');
    const laneEl = root.querySelector('[data-estimate-turnaround]');

    const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    let table = null;
    let targets = 1;
    let readout = 'BLI';
    let fastRequested = false;
    let sourcing = false;

    function clamp(n) {
        if (!table) return n;
        return Math.min(table.max, Math.max(table.min, Math.round(n) || table.min));
    }

    function render(typed) {
        if (!table) return;
        if (typed !== undefined && typed < table.min) {
            totalEl.textContent = 'Quoted';
            perEl.textContent = `Fewer than ${table.min} designs is quoted per project.`;
            laneEl.textContent = '';
            return;
        }

        const n = clamp(Number(slider.value));
        const i = n - table.min;
        const t = targets - 1;
        const r = Math.max(0, table.readouts.indexOf(readout));
        const fast = fastRequested && table.fast[r][t][i] === 1;
        const total = table.prices[r][t][fast ? 1 : 0][sourcing ? 1 : 0][i] * table.unit;

        totalEl.textContent = money.format(total);
        perEl.textContent = `≈ ${money.format(Math.round(total / n))} / design${targets > 1 ? ` · ${targets} targets` : ''}`;

        // BLI orders under 16 designs with a supplied target always run on fast synthesis.
        const smallFast = readout === 'BLI' && n < 16 && !sourcing;
        let lane = fast || smallFast ? 'Fast synthesis · 5-day TAT' : 'High-throughput · 2–3 week TAT';
        if (smallFast && !fastRequested) lane += ' · orders under 16 designs run on fast synthesis';
        if (fastRequested && !fast) lane += ' · fast synthesis unavailable for this selection';
        const addOn = table.addOn[r][t][fast ? 1 : 0][i] * table.unit;
        if (sourcing && addOn > 0) lane += ` · includes ${money.format(addOn)} target sourcing`;
        if (readout === 'BLI' && sourcing && n < 25) lane += ' · priced for targets on our stocked list; other targets quoted';
        laneEl.textContent = lane;

        slider.style.setProperty('--fill', `${(i / (table.max - table.min)) * 100}%`);
    }

    function bindToggle(buttons, onSelect) {
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
                onSelect(button);
                render();
            });
        });
    }

    bindToggle(targetButtons, (b) => { targets = Number(b.dataset.targets) || 1; });
    bindToggle(readoutButtons, (b) => { readout = b.dataset.readout; });
    bindToggle(speedButtons, (b) => { fastRequested = b.dataset.speed === 'fast'; });
    bindToggle(sourceButtons, (b) => { sourcing = b.dataset.source === 'litmus'; });

    slider.addEventListener('input', () => {
        count.value = slider.value;
        render();
    });

    count.addEventListener('input', () => {
        if (count.value === '') return;
        const typed = Math.round(Number(count.value));
        slider.value = clamp(typed);
        render(typed);
    });

    count.addEventListener('change', () => {
        // Keep a below-minimum entry visible so the "quoted" message makes sense.
        if (table && Number(count.value) >= table.min) count.value = slider.value;
    });

    fetch(new URL('arrayed-prices.json', document.currentScript?.src ?? location.href))
        .then((response) => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            table = data;
            slider.min = table.min;
            slider.max = table.max;
            count.min = table.min;
            count.max = table.max;
            root.classList.add('is-ready');
            render();
        })
        .catch(() => {
            totalEl.textContent = 'Quoted';
            perEl.textContent = 'Live estimate unavailable — request a quote.';
            laneEl.textContent = '';
        });
})();
