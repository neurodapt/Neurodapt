
const file_path = "./Doc.md";

// Define the initial state of the application
const state = {
    document: {
        rawText: ""
    },
    clauses: []
};

function logWithTimestamp(message) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + now.getMilliseconds().toString().padStart(3, '0');
    console.log(`[${timeString}] ${message}`);
}
// Extract the title from the first line of markdown text
function getTitle(text) {
    return "Document.md"
}

//Load the document content from a markdown file into the object : text
 async function loadDocument() {
    const response = await fetch(file_path)

    state.document.rawText = await response.text();
    renderRawDocument(state.document.rawText);
    // Set the document title from the first line of the markdown
    const title = getTitle(state.document.rawText);
    const titleEl = document.getElementById("document-title");
    if (titleEl) titleEl.textContent = title;
    // Initialize overall score display to 0% before segmentation
    state.overallScore = 0;
    renderOverallScore();
    await segmentDocument();
}

// Calculate the overall score as the average of clause scores
function calculateOverallScore() {
    if (!state.clauses || state.clauses.length === 0) return 0;
    const sum = state.clauses.reduce((s, c) => s + (typeof c.score === 'number' ? c.score : 0), 0);
    return sum / state.clauses.length;
}

// Render the overall score and progress fill
function renderOverallScore() {
    const overallEl = document.getElementById("overall-score");
    if (overallEl) {
        overallEl.textContent = `${Math.round((state.overallScore || 0) * 100)}%`;
    }
    const fill = document.getElementById("score-fill");
    if (fill) {
        fill.style.width = `${(state.overallScore || 0) * 100}%`;
    }
}

//Render the document content in the HTML page
function renderRawDocument(text) {
    const container = document.getElementById("document-content");
    container.textContent = text;
}

async function segmentDocument() {
    try {
        logWithTimestamp("Sending document for segmentation text: " + state.document.rawText.slice(0, 50) + "...");
        const response = await fetch("http://localhost:8000/segment",
            {method: "POST",headers: {"Content-Type": "application/json"},
            body: JSON.stringify({text: state.document.rawText})}
        );

        const data = await response.json();
        logWithTimestamp("API response received:"+ " " + JSON.stringify(data).slice(0, 100) + "...");
        state.clauses = data.clauses;
        assignFakeMemoryScores();
        // Recalculate overall score and render it, then render clauses
        state.overallScore = calculateOverallScore();
        renderOverallScore();
        console.log(state.clauses);
        renderClauses();
    } 
    catch(error){ console.error("Segmentation failed:", error);}
}

function assignFakeMemoryScores() {
    state.clauses = state.clauses.map(clause => ({text: clause,score: Math.min(Math.random(), Math.random())}));
}

function scoreToColor(score) {
    const hue = score * 120;
    return `hsla(${hue}, 80%, 65%, 0.55)`;
}

function renderClauses() {
    const container =document.getElementById("document-content");
    container.innerHTML = "";

    state.clauses.forEach((clause, index) => {
        const span = document.createElement("span");
        span.classList.add("clause");
        span.textContent = clause.text;
        span.style.backgroundColor =scoreToColor(clause.score);
        span.dataset.clauseId = index;
        span.dataset.score = clause.score;
        span.title =`Memory score: ${(clause.score * 100).toFixed(1)}%`;
        container.appendChild(span);
        // Preserve spacing between clauses
        container.appendChild(document.createTextNode(" "));
    });
}

loadDocument();
// Attach click handler for the Improve Memorability button

// Generate gibberish of approximately the same length as the input text
function generateGibberish(text) {
    const consonants = "bcdfghjklmnpqrstvwxz";
    const vowels = "aeiou";
    const specials = "!@#$%^&*(){}[]<>?/\\|~`+=_¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿×÷ØÞßæđðħıłœŒſŁŻ";
    const targetLength = Math.max(1, text.length);

    let result = "";
    while (result.length < targetLength) {
        let word = "";
        const wordLength = 2 + Math.floor(Math.random() * 6);
        for (let i = 0; i < wordLength; i++) {
            const roll = Math.random();
            let ch;
            if (roll < 0.45) {
                // Mostly consonants/vowels for a word-like feel
                const pool = i % 2 === 0 ? consonants : vowels;
                ch = pool[Math.floor(Math.random() * pool.length)];
            } else if (roll < 0.7) {
                ch = String(Math.floor(Math.random() * 10));
            } else {
                ch = specials[Math.floor(Math.random() * specials.length)];
            }
            word += ch;
        }
        result += (result ? " " : "") + word;
    }
    return result.slice(0, targetLength);
}

// Quickly scramble a clause into gibberish: gibberish creeps in from the left,
// replacing the original text progressively over durationMs.
async function animateToGibberish(span, originalText, gibberishText, durationMs) {
    const totalSteps = 8;
    const stepMs = durationMs / totalSteps;
    for (let step = 0; step <= totalSteps; step++) {
        const ratio = step / totalSteps;
        const gibberishLen = Math.round(gibberishText.length * ratio);
        // Gibberish takes over from the left; original text lingers on the right
        const origLen = Math.max(0, originalText.length - gibberishLen);
        span.textContent = gibberishText.slice(0, gibberishLen) + originalText.slice(origLen);
        await sleep(stepMs);
    }
    span.textContent = gibberishText;
}

// Progressively replace gibberish with the rewritten text over durationMs:
// the improved text creeps in from the left while gibberish lingers on the right.
async function animateRewrite(span, gibberishText, rewrittenText, durationMs) {
    const totalSteps = 8;
    const stepMs = durationMs / totalSteps;
    for (let step = 0; step <= totalSteps; step++) {
        const ratio = step / totalSteps;
        const newLen = Math.round(rewrittenText.length * ratio);
        const gibLen = Math.max(0, gibberishText.length - newLen);
        span.textContent = rewrittenText.slice(0, newLen) + gibberishText.slice(gibLen);
        await sleep(stepMs);
    }
    span.textContent = rewrittenText;
}

// Simulate a backend rewrite request (2-3 s).
// TODO: Replace with real POST /rewrite API
function fakeRewriteAPI() {
    const delayMs = 2000 + Math.random() * 1000;
    logWithTimestamp(`Simulating rewrite request (${Math.round(delayMs)} ms)...`);
    return new Promise(resolve => setTimeout(resolve, delayMs));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Improve document memorability:
// gibberish -> (fake backend rewrite) -> rewritten text,
// updating each clause's score, color, and the overall score one clause at a time.
async function improveDocument() {
    if (!state.clauses || state.clauses.length === 0) return;

    const improveBtn = document.getElementById("improve-btn");
    if (improveBtn) improveBtn.disabled = true;

    // 1. Generate gibberish for every clause (approximately the same length)
    const improved = state.clauses.map(clause => ({
        original: clause.text,
        text: clause.text,
        score: typeof clause.score === 'number' ? clause.score : 0,
        gibberish: generateGibberish(clause.text)
    }));

    // 1b. Turn every clause into gibberish, clause by clause: each clause
    //     scrambles progressively (~250 ms) with a short stagger between clauses
    for (let i = 0; i < improved.length; i++) {
        const span = document.querySelector(`[data-clause-id="${i}"]`);
        if (span) {
            span.classList.add("gibberish");
            await animateToGibberish(span, improved[i].original, improved[i].gibberish, 1000);
        }
        await sleep(120);
    }

    // 2. Wait 2-3 seconds to simulate a backend rewrite request
    await fakeRewriteAPI();

    // 3-6. Replace gibberish with rewritten text one clause at a time (~150 ms stagger),
    //      increasing the score and updating color + overall score after each replacement
    for (let i = 0; i < improved.length; i++) {
        const clause = improved[i];

        // 3. Placeholder rewritten text (TODO: use real /rewrite API response)
        clause.text = `${clause.original} (rewritten)`;

        // 4. Increase the clause score by a random 0.30-0.50, capped at 1.0
        clause.score = Math.min(1, clause.score + 0.30 + Math.random() * 0.20);

        // 5. Update clause color and overall score after each clause replacement,
        //    animating the rewritten text in over ~600 ms
        const span = document.querySelector(`[data-clause-id="${i}"]`);
        if (span) {
            await animateRewrite(span, improved[i].gibberish, clause.text, 600);
            span.classList.remove("gibberish");
            span.style.backgroundColor = scoreToColor(clause.score);
            span.dataset.score = clause.score;
            span.title = `Memory score: ${(clause.score * 100).toFixed(1)}%`;
        }

        state.clauses = improved.map((c, idx) => ({ text: c.text, score: c.score }));
        state.overallScore = calculateOverallScore();
        renderOverallScore();

        // 6. Small stagger between clause replacements
        await sleep(150);
    }

    console.log("Memorability improved");
    if (improveBtn) improveBtn.disabled = false;
}

const improveBtn = document.getElementById("improve-btn");
if (improveBtn) {
    improveBtn.addEventListener("click", improveDocument);
}

