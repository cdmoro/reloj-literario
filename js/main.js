import { NOT_FOUND_QUOTES } from './utils.js';

const clock = document.getElementById("clock");
let statistics;
let lastTime;

async function getStatistics() {
    const response = await fetch(`../scripts/statistics.json`);
    statistics = await response.json();
}

function getRandomItem(quotes, time) {
    if (!quotes.length) {
        quotes = NOT_FOUND_QUOTES;
    }

    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    if (!quote.quote_time_case) {
        quote.time = time;
        quote.quote_time_case = time;

        const url = new URL('https://github.com/cdmoro/reloj-literario/issues/new');
        url.searchParams.set('title', `[${time}] Agregar nueva frase`);

        quote.link = /*html*/`(si sabés de alguna hace click <a href='${url.href}' target='_blank'>acá</a> o escribinos!)`;
    }

    return quote;
}

async function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let quotes = [];
    let quote = {};
    let html = "";
    const fileName = `${hours.toString().padStart(2, '0')}_${minutes.toString().padStart(2, '0')}`;
    const time = fileName.replace("_", ":");

    if (lastTime !== time) {
        const response = await fetch(`../times/${fileName}.json`);
        quotes = await response.json();
        quote = getRandomItem(quotes, time);

        html = /*html*/`
            <blockquote aria-label="${quote.time}">
                <p>${quote.quote_first}<strong>${quote.quote_time_case}</strong>${quote.quote_last}</p>
                <cite>${quote.title}, ${quote.author}</cite>
        `;

        if (quote.link) {
            html += /*html*/`
                <div id="link">${quote.link}</div>
            `;
        }

        html += `</blockquote>`;

        clock.innerHTML = html;
        lastTime = time;
    }
}

updateTime();
getStatistics();

setInterval(updateTime, 1000);