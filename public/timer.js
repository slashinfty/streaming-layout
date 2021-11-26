const Mousetrap = require('mousetrap');
var stopwatch, countdown;

document.addEventListener("DOMContentLoaded", () => {
    Mousetrap.bind('f1', () => {
        if (stopwatch !== undefined) stopwatch.start();
    });

    Mousetrap.bind('f4', () => {
        if (stopwatch !== undefined) stopwatch.stop();
    });

    Mousetrap.bind('f8', () => {
        if (stopwatch !== undefined) stopwatch.reset();
    });
});

ipcRenderer.on('timer-set', (event, secondsString) => {
    if (!stopwatch.running) {
        stopwatch.ms = Number(secondsString) * 1000;
        stopwatch.print();
    }
});

ipcRenderer.on('timer', (event, message) => {
    switch (message) {
        case 'toggle':
            if (stopwatch === undefined) {
                stopwatch = new Stopwatch(document.getElementById('timer'));
            } else {
                if (stopwatch.running) stopwatch.reset();
                stopwatch.display.style.display = 'none';
                stopwatch = undefined;
            }
            break;
        case 'start':
            if (stopwatch !== undefined) stopwatch.start();
            break;
        case 'stop':
            if (stopwatch !== undefined) stopwatch.stop();
            break;
        case 'reset':
            if (stopwatch !== undefined) stopwatch.reset();
            break;
        default:
            break;
    }
});

class Stopwatch {
    constructor(display) {
        this.running = false;
        this.display = display;
        this.display.style.display = 'block';
        this.reset();
    }

    start() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    stop() {
        this.running = false;
        this.time = null;
    }

    reset() {
        if (this.running) this.stop();
        this.ms = 0;
        this.print();
    }

    step(timestamp) {
        if (!this.running) return;
        this.ms += timestamp - this.time;
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }

    print() {
        const sec = Math.floor(this.ms / 1000);
        const prime = (n, r) => {
            var r = (r || []);
            let root = Math.sqrt(n);
            let x = 2;
            if (n % x) {
                x = 3;
                while ((n % x) && ((x = (x + 2)) < root)) {}
            }
            x = x <= root ? x : n;
            r.push(x);
            return (x === n) ? r : prime((n / x), r);
        };
        const arr = prime(sec);
        let code = '';
        let s = 1;
        arr.forEach((e, i) => {
            if (i === 0) code += e;
            else {
                if (e !== arr[i - 1]) {
                    if (s > 1) code += `<span class="sup">${s.toString()}</span>`;
                    code += `&#183;${e.toString()}`;
                    s = 1;
                } else {
                    s++;
                    if (i === arr.length - 1) code += `<span class="sup">${s.toString()}</span>`;
                }
            }
        });
        this.display.innerHTML = code;
    }
}

class Countdown extends Stopwatch {
    constructor(display, start) {
        super(display);
        this.ms = Number(start) * 1000;
        this.print();
    }

    step(timestamp) {
        if (!this.running) return;
        this.ms -= timestamp - this.time;
        if (this.ms < 0) {
            this.stop();
            return;
        }
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }
}