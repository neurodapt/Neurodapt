/* ==========================================================================
   MEMORY AI — CORE APPLICATION SCRIPT
   In-Place Interactive Text Engine, File Parsers, Synchronized Compare & AI Chat
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. PRESET SAMPLE DOCUMENTS & DICTIONARY DATA
     -------------------------------------------------------------------------- */
  const PRESET_DOCUMENTS = {
    biology: {
      title: "Cellular Energy & Neural Transmission",
      text: `The mitochondria is the primary powerhouse of eukaryotic cells, responsible for generating adenosine triphosphate through oxidative phosphorylation. 
During cellular respiration, electron transport chains maintain homeostasis by pumping protons across the inner mitochondrial membrane.

In neurons, action potentials propagate rapidly along myelinated axons toward the axon terminal. When the electrical signal arrives, voltage-gated calcium channels trigger exocytosis of neurotransmitters into the synaptic cleft. 

Furthermore, neuroplasticity and synaptic pruning enable the brain to dynamically reconfigure postsynaptic density receptor sensitivity in response to learning and environmental stimuli.`
    },
    quantum: {
      title: "Quantum Superposition & Entanglement",
      text: `In quantum mechanics, superposition dictates that a subatomic particle can simultaneously exist in multiple eigenstates until quantum measurement forces wave-function collapse.

Furthermore, quantum entanglement creates an instantaneous correlation between spatially separated photons. Even when separated by astronomical distances, measuring the spin state of one particle immediately determines the reciprocal state of its entangled partner, defying classical intuition of local realism.`
    },
    economics: {
      title: "Macroeconomics & Inflationary Dynamics",
      text: `Macroeconomic equilibrium relies heavily on monetary policy instruments controlled by central banks. When economies face stagnation, quantitative easing is deployed to inject liquidity into financial markets.

However, unchecked monetary expansion can trigger hyperinflation, diminishing consumer purchasing power and destabilizing commercial trade balances. Economists must balance interest rate adjustments to maintain fiscal stability.`
    },
    law: {
      title: "Constitutional Jurisprudence & Precedent",
      text: `Constitutional jurisprudence establishes legal principles governing statutory interpretation and judicial review. Courts rely on stare decisis to maintain legal consistency and institutional credibility.

When lower tribunals encounter ambiguous statutory language, appellate courts synthesize legal precedents to resolve procedural discrepancies and preserve fundamental constitutional guarantees.`
    }
  };

  // Comprehensive technical/academic jargon mapping to simple terms
  const JARGON_DICTIONARY = {
    "mitochondria": { simple: "energy factory", tooltip: "Organelle producing cell energy" },
    "powerhouse": { simple: "main source of energy", tooltip: "Primary energy generator" },
    "eukaryotic": { simple: "complex multi-cell", tooltip: "Cells with nuclei" },
    "adenosine triphosphate": { simple: "cellular fuel (ATP)", tooltip: "Energy carrying molecule" },
    "oxidative phosphorylation": { simple: "oxygen energy production", tooltip: "Process making ATP with oxygen" },
    "homeostasis": { simple: "internal balance", tooltip: "Stable state inside body" },
    "mitochondrial": { simple: "cell-energy", tooltip: "Relating to cell powerhouse" },
    "action potentials": { simple: "electrical nerve pulses", tooltip: "Nerve signal spikes" },
    "action potential": { simple: "electrical nerve pulse", tooltip: "Nerve signal spike" },
    "myelinated": { simple: "insulated nerve", tooltip: "Covered in protective sheath" },
    "axons": { simple: "nerve signal wires", tooltip: "Long nerve fibers" },
    "axon terminal": { simple: "nerve output tip", tooltip: "End of nerve cell" },
    "exocytosis": { simple: "chemical release", tooltip: "Exporting molecules from cell" },
    "neurotransmitters": { simple: "brain chemical signals", tooltip: "Chemical messengers" },
    "synaptic cleft": { simple: "nerve cell gap", tooltip: "Space between brain cells" },
    "neuroplasticity": { simple: "brain adaptability", tooltip: "Brain's ability to re-wire" },
    "synaptic pruning": { simple: "brain pathway cleanup", tooltip: "Removing unused neural paths" },
    "postsynaptic density": { simple: "signal receiver zone", tooltip: "Receptor area on nerve" },
    "superposition": { simple: "dual state existence", tooltip: "Existing in multiple states at once" },
    "eigenstates": { simple: "quantum energy states", tooltip: "Possible quantum conditions" },
    "wave-function collapse": { simple: "quantum state lock-in", tooltip: "Settling into 1 definitive state" },
    "entanglement": { simple: "instant particle connection", tooltip: "Linked quantum pairs" },
    "reciprocal": { simple: "matching opposite", tooltip: "Corresponding in return" },
    "macroeconomic": { simple: "overall economy", tooltip: "Large scale economics" },
    "equilibrium": { simple: "stable economic balance", tooltip: "State of supply/demand balance" },
    "monetary policy": { simple: "central bank money rules", tooltip: "Control of money supply" },
    "stagnation": { simple: "economic slowdown", tooltip: "Lack of growth" },
    "quantitative easing": { simple: "bank money injection", tooltip: "Central bank purchasing assets" },
    "liquidity": { simple: "cash flow", tooltip: "Available money for trading" },
    "hyperinflation": { simple: "extreme price surges", tooltip: "Out of control inflation" },
    "jurisprudence": { simple: "legal theory & law study", tooltip: "Philosophy of law" },
    "stare decisis": { simple: "following past rulings", tooltip: "Respecting legal precedent" },
    "ambiguous": { simple: "unclear & vague", tooltip: "Open to multiple meanings" },
    "statutory": { simple: "written law", tooltip: "Enacted by legislature" },
    "tribunals": { simple: "courts of justice", tooltip: "Judicial bodies" },
    "synthesize": { simple: "combine & summarize", tooltip: "Blend ideas together" },
    "precedents": { simple: "past court rulings", tooltip: "Earlier legal decisions" },
    "procedural": { simple: "court process", tooltip: "Related to legal steps" },
    "discrepancies": { simple: "differences & conflicts", tooltip: "Inconsistencies" }
  };

  /* --------------------------------------------------------------------------
     2. GLOBAL STATE
     -------------------------------------------------------------------------- */
  const state = {
    currentPreset: "biology",
    docTitle: "Cellular Energy & Neural Transmission",
    rawText: "",
    rewrittenText: "",
    pipelineResults: null,
    hardWordsList: [], // Array of hard word descriptors found in current doc
    simplifiedMap: new Map(), // wordId -> simplifiedText
    viewMode: "original", // "original" | "simplified"
    isCompareMode: false,
    fontSize: 16,
    searchQuery: "",
    sensitivity: "medium",
    animSpeed: "normal",
    apiConfig: {
      baseURL: "https://api.aicredits.in/v1",
      model: "openai/gpt-5-nano",
      apiKey: "",
      useProxy: true
    },
    isRewritten: false,
    stats: {
      words: 0,
      chars: 0,
      readingTime: "0 min",
      hardWordsCount: 0,
      simplifiedCount: 0,
      memoryScore: 72
    },
    flashcardIndex: 0,
    quizIndex: 0,
    quizScore: 0,
    currentSelectionText: ""
  };

  /* --------------------------------------------------------------------------
     3. DOM ELEMENTS CACHE
     -------------------------------------------------------------------------- */
  const elements = {
    sidebar: document.getElementById('sidebar'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    btnNewSession: document.getElementById('btnNewSession'),
    btnSidebarUpload: document.getElementById('btnSidebarUpload'),
    btnHeaderUpload: document.getElementById('btnHeaderUpload'),
    btnBottomUpload: document.getElementById('btnBottomUpload'),
    fileInput: document.getElementById('fileInput'),
    sessionList: document.getElementById('sessionList'),

    docTitle: document.getElementById('docTitle'),
    searchInput: document.getElementById('searchInput'),
    searchCount: document.getElementById('searchCount'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    modeToggle: document.getElementById('modeToggle'),
    labelOriginal: document.getElementById('labelOriginal'),
    labelSimplified: document.getElementById('labelSimplified'),
    btnCompare: document.getElementById('btnCompare'),
    btnHeaderPaste: document.getElementById('btnHeaderPaste'),

    singleViewer: document.getElementById('singleViewer'),
    compareViewer: document.getElementById('compareViewer'),
    textContent: document.getElementById('textContent'),
    originalPaneContent: document.getElementById('originalPaneContent'),
    simplifiedPaneContent: document.getElementById('simplifiedPaneContent'),
    viewModePill: document.getElementById('viewModePill'),
    rewriteStatusPill: document.getElementById('rewriteStatusPill'),
    dropzoneOverlay: document.getElementById('dropzoneOverlay'),

    btnIncreaseFont: document.getElementById('btnIncreaseFont'),
    btnDecreaseFont: document.getElementById('btnDecreaseFont'),
    btnFullscreen: document.getElementById('btnFullscreen'),

    btnRewrite: document.getElementById('btnRewrite'),
    btnClear: document.getElementById('btnClear'),
    btnCopyOutput: document.getElementById('btnCopyOutput'),
    btnExportDropdown: document.getElementById('btnExportDropdown'),
    exportMenu: document.getElementById('exportMenu'),
    btnExportTxt: document.getElementById('btnExportTxt'),
    btnExportPdf: document.getElementById('btnExportPdf'),
    btnPrint: document.getElementById('btnPrint'),

    statWords: document.getElementById('statWords'),
    statChars: document.getElementById('statChars'),
    statReadingTime: document.getElementById('statReadingTime'),
    statHardWords: document.getElementById('statHardWords'),
    statSimplified: document.getElementById('statSimplified'),
    statMemoryScore: document.getElementById('statMemoryScore'),
    scoreBarFill: document.getElementById('scoreBarFill'),

    chatMessages: document.getElementById('chatMessages'),
    chatForm: document.getElementById('chatForm'),
    chatInput: document.getElementById('chatInput'),
    pipelineStatusArea: document.getElementById('pipelineStatusArea'),

    floatingToolbar: document.getElementById('floatingToolbar'),
    ftExplain: document.getElementById('ftExplain'),
    ftRewrite: document.getElementById('ftRewrite'),
    ftMnemonic: document.getElementById('ftMnemonic'),
    ftSummarize: document.getElementById('ftSummarize'),
    ftCopy: document.getElementById('ftCopy'),
    wordTooltip: document.getElementById('wordTooltip'),

    // Modals
    pasteModal: document.getElementById('pasteModal'),
    pasteTextarea: document.getElementById('pasteTextarea'),
    cancelPasteBtn: document.getElementById('cancelPasteBtn'),
    pasteClipboardBtn: document.getElementById('pasteClipboardBtn'),
    confirmPasteBtn: document.getElementById('confirmPasteBtn'),
    closePasteModal: document.getElementById('closePasteModal'),

    settingsModal: document.getElementById('settingsModal'),
    btnSettings: document.getElementById('btnSettings'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    apiBaseUrlInput: document.getElementById('apiBaseUrlInput'),
    apiModelInput: document.getElementById('apiModelInput'),
    apiKeyInput: document.getElementById('apiKeyInput'),

    flashcardsModal: document.getElementById('flashcardsModal'),
    btnLaunchFlashcards: document.getElementById('btnLaunchFlashcards'),
    closeFlashcardsModal: document.getElementById('closeFlashcardsModal'),
    flashcardElement: document.getElementById('flashcardElement'),
    fcQuestion: document.getElementById('fcQuestion'),
    fcAnswer: document.getElementById('fcAnswer'),
    fcCounter: document.getElementById('fcCounter'),
    btnFcPrev: document.getElementById('btnFcPrev'),
    btnFcNext: document.getElementById('btnFcNext'),

    quizModal: document.getElementById('quizModal'),
    btnLaunchQuiz: document.getElementById('btnLaunchQuiz'),
    closeQuizModal: document.getElementById('closeQuizModal'),
    quizProgressFill: document.getElementById('quizProgressFill'),
    quizQNum: document.getElementById('quizQNum'),
    quizQTitle: document.getElementById('quizQTitle'),
    quizOptions: document.getElementById('quizOptions'),
    btnQuizNext: document.getElementById('btnQuizNext'),

    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
  };

  const API_CONFIG_STORAGE_KEY = 'memory-ai-api-config';
  const PIPELINE_STEP_IDS = ['pipelineStep1', 'pipelineStep2', 'pipelineStep3', 'pipelineStep4'];
  const PIPELINE_STEP_COPY = [
    { label: 'Clause Segmentation', running: 'Performing Clause Segmentation...', complete: 'Clause Segmentation Complete' },
    { label: 'Find Hard Words', running: 'Finding Hard Words...', complete: 'Hard Words Identified' },
    { label: 'Generate Simplified Rewrite', running: 'Generating Memorability Rewrite...', complete: 'Rewrite Generated' },
    { label: 'Analyze Rewritten Text', running: 'Analyzing Rewritten Text...', complete: 'Analysis Complete' }
  ];

  /* --------------------------------------------------------------------------
     4. AI HELPER STUBS & HARD WORD SCANNER
     -------------------------------------------------------------------------- */
  
  /**
   * Scans text to identify difficult academic terms.
   * Matches dictionary keys and applies length heuristics.
   */
  function findHardWords(text) {
    const wordsFound = [];
    let idCounter = 0;

    // Sort dictionary keys by length descending to match multi-word phrases first
    const dictKeys = Object.keys(JARGON_DICTIONARY).sort((a, b) => b.length - a.length);

    dictKeys.forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const info = JARGON_DICTIONARY[key];
        wordsFound.push({
          id: `hw-${idCounter++}`,
          original: match[0],
          key: key.toLowerCase(),
          simplified: info.simple,
          tooltip: info.tooltip,
          index: match.index,
          length: match[0].length
        });
      }
    });

    return wordsFound;
  }

  /**
   * Returns a simplified synonym or phrase for a word.
   */
  function rewriteWord(word) {
    const key = word.toLowerCase();
    if (JARGON_DICTIONARY[key]) {
      return JARGON_DICTIONARY[key].simple;
    }
    return word; // Fallback
  }

  function normalizeBaseURL(baseURL) {
    return (baseURL || '').trim().replace(/\/$/, '');
  }

  function resetPipelineStatus() {
    PIPELINE_STEP_IDS.forEach((stepId, index) => {
      const stepElement = document.getElementById(stepId);
      if (!stepElement) return;

      stepElement.dataset.state = 'idle';
      stepElement.classList.remove('is-running', 'is-complete');

      const icon = stepElement.querySelector('.pipeline-status-icon i');
      const text = stepElement.querySelector('.pipeline-status-text');
      if (icon) icon.className = 'fa-solid fa-circle';
      if (text) text.textContent = PIPELINE_STEP_COPY[index].label;
    });
  }

  function setPipelineStepState(stepNumber, status) {
    const stepElement = document.getElementById(PIPELINE_STEP_IDS[stepNumber - 1]);
    if (!stepElement) return;

    const stepCopy = PIPELINE_STEP_COPY[stepNumber - 1];
    const icon = stepElement.querySelector('.pipeline-status-icon i');
    const text = stepElement.querySelector('.pipeline-status-text');

    stepElement.dataset.state = status;
    stepElement.classList.remove('is-running', 'is-complete');

    if (status === 'running') {
      stepElement.classList.add('is-running');
      if (icon) icon.className = 'fa-solid fa-spinner fa-spin';
      if (text) text.textContent = stepCopy.running;
      return;
    }

    if (status === 'complete') {
      stepElement.classList.add('is-complete');
      if (icon) icon.className = 'fa-solid fa-check';
      if (text) text.textContent = stepCopy.complete;
      return;
    }

    if (icon) icon.className = 'fa-solid fa-circle';
    if (text) text.textContent = stepCopy.label;
  }

  function completeEarlierPipelineSteps(stepNumber) {
    for (let index = 1; index < stepNumber; index += 1) {
      setPipelineStepState(index, 'complete');
    }
  }

  function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  function loadApiConfig() {
    try {
      const saved = localStorage.getItem(API_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.apiConfig = {
          baseURL: parsed.baseURL || state.apiConfig.baseURL,
          model: parsed.model || state.apiConfig.model,
          apiKey: parsed.apiKey || state.apiConfig.apiKey,
          useProxy: typeof parsed.useProxy === 'boolean' ? parsed.useProxy : state.apiConfig.useProxy
        };
      }
    } catch (error) {
      console.warn('Failed to load API config', error);
    }

    state.apiConfig.useProxy = true;

    if (elements.apiBaseUrlInput) elements.apiBaseUrlInput.value = state.apiConfig.baseURL;
    if (elements.apiModelInput) elements.apiModelInput.value = state.apiConfig.model;
    if (elements.apiKeyInput) elements.apiKeyInput.value = state.apiConfig.apiKey;
  }

  function saveApiConfig() {
    state.apiConfig = {
      baseURL: normalizeBaseURL(elements.apiBaseUrlInput?.value || state.apiConfig.baseURL),
      model: (elements.apiModelInput?.value || state.apiConfig.model).trim(),
      apiKey: (elements.apiKeyInput?.value || state.apiConfig.apiKey).trim(),
      useProxy: state.apiConfig.useProxy !== false
    };

    localStorage.setItem(API_CONFIG_STORAGE_KEY, JSON.stringify(state.apiConfig));
  }

  function extractJsonObject(text) {
    const trimmed = (text || '').trim();
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw error;
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function callChatCompletion(messages, options = {}) {
    const { responseFormat = null, temperature = 0.2 } = options;
    const { baseURL, model, apiKey } = state.apiConfig;

    const requestBody = {
      model,
      messages,
      temperature,
      ...(responseFormat ? { response_format: responseFormat } : {})
    };

    const proxyUrl = '/api/chat';
    const directUrl = `${normalizeBaseURL(baseURL)}/chat/completions`;
    const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);
    const shouldTryProxy = state.apiConfig.useProxy !== false && window.location.protocol !== 'file:' && !isLocalHost;

    let response;
    if (shouldTryProxy) {
      response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok && apiKey) {
        response = await fetch(directUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });
      }
    } else {
      if (!apiKey) {
        throw new Error('No server proxy detected. Add an API key for direct mode or deploy to Vercel.');
      }

      response = await fetch(directUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM request failed (${response.status}): ${errorText}`);
    }

    const payload = await response.json();
    return payload?.choices?.[0]?.message?.content || '';
  }

  async function segmentClauses(text) {
    const content = await callChatCompletion([
      {
        role: 'system',
        content: 'You segment paragraphs into clauses. Return only valid JSON.'
      },
      {
        role: 'user',
        content: `Segment this paragraph into clauses. Return JSON in this exact shape: {"clauses":[{"id":1,"text":"..."}]}. Preserve original wording and order. Paragraph:\n\n${text}`
      }
    ], {
      temperature: 0,
      responseFormat: { type: 'json_object' }
    });

    const parsed = extractJsonObject(content);
    return Array.isArray(parsed.clauses) ? parsed.clauses : [];
  }

  async function detectHardWords(text) {
    const content = await callChatCompletion([
      {
        role: 'system',
        content: 'You identify difficult words and multi-word technical phrases that are harder than average for a college student to remember. Return JSON only.'
      },
      {
        role: 'user',
        content: `Text:\n\n${text}\n\nReturn ONLY\n\n{\n  "hard_words":[\n    "word1",\n    "word2",\n    "technical phrase"\n  ]\n}`
      }
    ], {
      temperature: 0,
      responseFormat: {
        type: 'json_object'
      }
    });

    const parsed = extractJsonObject(content);
    return Array.isArray(parsed.hard_words) ? parsed.hard_words : [];
  }

  async function rewriteMemorableParagraph(text, hardWords) {
    return callChatCompletion([
      {
        role: 'system',
        content: 'Rewrite educational text to maximize human memorability without losing information.'
      },
      {
        role: 'user',
        content: `Rewrite the following passage.

Rules

- Preserve meaning.
- Simplify difficult vocabulary.
- Maximize memorability.
- Especially simplify these difficult words or phrases:

${hardWords.join(', ')}

- Never summarize.
- Never remove information.

Return ONLY the rewritten paragraph.

Text

${text}`
      }
    ], {
      temperature: 0.3
    });
  }

  function simplifyTextLocally(text) {
    let simplified = text;
    const dictKeys = Object.keys(JARGON_DICTIONARY).sort((a, b) => b.length - a.length);

    dictKeys.forEach(key => {
      const regex = new RegExp(`\\b${escapeRegExp(key)}\\b`, 'gi');
      simplified = simplified.replace(regex, JARGON_DICTIONARY[key].simple);
    });

    return simplified;
  }

  function splitIntoClauses(text) {
    return text
      .split(/\n+/)
      .flatMap(paragraph => paragraph.match(/[^.!?]+[.!?]?/g) || [])
      .map(clause => clause.trim())
      .filter(Boolean);
  }

  function buildLocalFallbackResult(text) {
    const clauses = splitIntoClauses(text).map((clause, index) => ({
      id: index + 1,
      text: clause
    }));

    const originalHardWords = [...new Set(findHardWords(text).map(word => word.original))];
    const rewrittenText = simplifyTextLocally(text);
    const rewrittenHardWords = [...new Set(findHardWords(rewrittenText).map(word => word.original))];

    return { clauses, originalHardWords, rewrittenText, rewrittenHardWords };
  }

  function formatClauseSummary(clauses) {
    return clauses.map(clause => `${clause.id}. ${clause.text}`).join('\n');
  }

  /* --------------------------------------------------------------------------
     5. TEXT RENDERING ENGINE & HIGHLIGHTING
     -------------------------------------------------------------------------- */

  function loadDocument(title, text) {
    state.docTitle = title;
    state.rawText = text;
    state.rewrittenText = "";
    state.pipelineResults = null;
    state.isRewritten = false;
    state.simplifiedMap.clear();
    elements.docTitle.textContent = title;
    if (elements.modeToggle) elements.modeToggle.checked = false;
    state.viewMode = "original";

    // Detect hard words
    state.hardWordsList = findHardWords(text);
    state.stats.hardWordsCount = state.hardWordsList.length;
    state.stats.simplifiedCount = 0;
    resetPipelineStatus();

    renderDocumentView();
    updateStatistics();
    
    showToast(`Loaded "${title}" (${state.stats.words} words)`);
  }

  function openPasteModal() {
    elements.pasteModal.classList.remove('hidden');
    elements.pasteTextarea.focus({ preventScroll: true });
    elements.pasteTextarea.select();
  }

  function closePasteModal() {
    elements.pasteModal.classList.add('hidden');
  }

  function renderDocumentView() {
    const hasRewrittenText = Boolean(state.rewrittenText.trim());
    const originalHardWords = normalizeHardWordList(
      state.pipelineResults ? state.pipelineResults.originalHardWords : state.hardWordsList
    );
    const rewrittenHardWords = normalizeHardWordList(
      state.pipelineResults ? state.pipelineResults.rewrittenHardWords : []
    );
    const activeText = state.viewMode === "simplified" && hasRewrittenText ? state.rewrittenText : state.rawText;
    const activeHardWords = state.viewMode === "simplified" && hasRewrittenText ? rewrittenHardWords : originalHardWords;
    state.hardWordsList = activeHardWords;

    const renderedHtml = buildHighlightedHTML(activeText, activeHardWords);

    elements.textContent.innerHTML = renderedHtml;
    elements.originalPaneContent.innerHTML = buildHighlightedHTML(state.rawText, originalHardWords);
    elements.simplifiedPaneContent.innerHTML = hasRewrittenText
      ? buildHighlightedHTML(state.rewrittenText, rewrittenHardWords)
      : buildHighlightedHTML(state.rawText, []);

    // Apply font size
    elements.textContent.style.fontSize = `${state.fontSize}px`;
    elements.originalPaneContent.style.fontSize = `${state.fontSize}px`;
    elements.simplifiedPaneContent.style.fontSize = `${state.fontSize}px`;

    // Mode Pill Label
    if (state.viewMode === "original") {
      elements.viewModePill.innerHTML = `<i class="fa-solid fa-circle-dot"></i> Original Mode`;
      if (elements.labelOriginal) elements.labelOriginal.classList.add('active-red');
      if (elements.labelSimplified) elements.labelSimplified.classList.remove('active-green');
    } else {
      elements.viewModePill.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Simplified Mode`;
      if (elements.labelOriginal) elements.labelOriginal.classList.remove('active-red');
      if (elements.labelSimplified) elements.labelSimplified.classList.add('active-green');
    }

    elements.rewriteStatusPill.innerHTML = state.isRewritten 
      ? `<i class="fa-solid fa-circle-check"></i> ${state.stats.simplifiedCount} Words Simplified` 
      : `<i class="fa-solid fa-circle-exclamation"></i> ${state.stats.hardWordsCount} Hard Words Detected`;

    attachWordEventListeners();
  }

  function buildHighlightedHTML(text, hardWords = []) {
    if (!text) return '<p class="text-muted">No text loaded.</p>';

    const normalizedHardWords = normalizeHardWordList(hardWords);

    if (!normalizedHardWords.length) {
      return buildPlainHTML(text);
    }

    const paragraphs = text.split(/\n+/);

    return paragraphs.map(paragraph => {
      const matches = findPhraseMatches(paragraph, normalizedHardWords);

      if (!matches.length) {
        return `<p>${escapeHtml(paragraph)}</p>`;
      }

      let html = '';
      let cursor = 0;

      matches.forEach(match => {
        html += escapeHtml(paragraph.slice(cursor, match.start));
        html += `<span class="hard-word" data-word-id="${escapeHtml(match.word)}" data-original="${escapeHtml(match.word)}" data-simplified="${escapeHtml(match.word)}" data-tooltip="Hard word">${escapeHtml(paragraph.slice(match.start, match.end))}</span>`;
        cursor = match.end;
      });

      html += escapeHtml(paragraph.slice(cursor));
      return `<p>${html}</p>`;
    }).join('');
  }

  function buildPlainHTML(text) {
    if (!text) return '<p class="text-muted">No text loaded.</p>';

    return text
      .split(/\n+/)
      .filter(Boolean)
      .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
      .join('');
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizeHardWordList(words) {
    return (Array.isArray(words) ? words : [words])
      .map(word => {
        if (typeof word === 'string') {
          return word.trim();
        }

        if (word && typeof word === 'object') {
          return String(word.original || word.text || word.word || '').trim();
        }

        return '';
      })
      .filter(Boolean);
  }

  function buildPhraseRegex(phrase) {
    const escapedPhrase = escapeRegExp(phrase.trim());
    return new RegExp(`(?<![\\w-])${escapedPhrase}(?![\\w-])`, 'gi');
  }

  function findPhraseMatches(text, phrases) {
    const matches = [];

    [...new Set((phrases || []).map(phrase => String(phrase || '').trim()).filter(Boolean))]
      .sort((a, b) => b.length - a.length)
      .forEach(phrase => {
        const regex = buildPhraseRegex(phrase);
        let match;

        while ((match = regex.exec(text)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            word: phrase,
            length: match[0].length
          });

          if (match.index === regex.lastIndex) {
            regex.lastIndex += 1;
          }
        }
      });

    matches.sort((a, b) => b.length - a.length || a.start - b.start);

    const selected = [];
    for (const match of matches) {
      const overlaps = selected.some(existing => match.start < existing.end && match.end > existing.start);
      if (!overlaps) {
        selected.push(match);
      }
    }

    return selected.sort((a, b) => a.start - b.start);
  }

  /* --------------------------------------------------------------------------
     6. IN-PLACE REWRITE & ANIMATION ENGINE
     -------------------------------------------------------------------------- */

  async function executeRewrite() {
    saveApiConfig();

    if (!state.rawText.trim()) {
      showToast('Load or paste text before running the pipeline.');
      return;
    }

    try {
      setPipelineStepState(1, 'running');
      const clauses = await segmentClauses(state.rawText);
      setPipelineStepState(1, 'complete');

      setPipelineStepState(2, 'running');
      const originalHardWords = await detectHardWords(state.rawText);
      completeEarlierPipelineSteps(2);
      state.pipelineResults = {
        clauses,
        originalHardWords,
        rewrittenText: '',
        rewrittenHardWords: []
      };
      state.rewrittenText = '';
      state.hardWordsList = originalHardWords;
      state.isRewritten = false;
      state.viewMode = 'original';
      state.stats.hardWordsCount = originalHardWords.length;
      state.stats.simplifiedCount = 0;
      updateStatistics();
      renderDocumentView();
      await nextFrame();
      setPipelineStepState(2, 'complete');

      setPipelineStepState(3, 'running');
      const memorableRewrite = await rewriteMemorableParagraph(state.rawText, originalHardWords);
      setPipelineStepState(3, 'complete');

      state.pipelineResults = {
        clauses,
        originalHardWords,
        rewrittenText: memorableRewrite,
        rewrittenHardWords: []
      };
      state.rewrittenText = memorableRewrite;
      state.hardWordsList = originalHardWords;
      state.isRewritten = true;
      state.viewMode = 'simplified';
      if (elements.modeToggle) elements.modeToggle.checked = true;
      renderDocumentView();
      await nextFrame();

      setPipelineStepState(4, 'running');
      const rewrittenHardWords = await detectHardWords(memorableRewrite);
      setPipelineStepState(4, 'complete');

      state.pipelineResults = {
        clauses,
        originalHardWords,
        rewrittenText: memorableRewrite,
        rewrittenHardWords
      };
      state.stats.hardWordsCount = originalHardWords.length;
      state.stats.simplifiedCount = Math.max(0, originalHardWords.length - rewrittenHardWords.length);
      updateStatistics();
      renderDocumentView();

      showToast('4-step LLM pipeline completed!');
    } catch (error) {
      console.error(error);
      const fallback = buildLocalFallbackResult(state.rawText);
      state.pipelineResults = {
        clauses: fallback.clauses,
        originalHardWords: fallback.originalHardWords,
        rewrittenText: fallback.rewrittenText,
        rewrittenHardWords: fallback.rewrittenHardWords
      };
      state.rewrittenText = fallback.rewrittenText;
      state.hardWordsList = fallback.originalHardWords;
      state.isRewritten = true;
      state.viewMode = 'simplified';
      if (elements.modeToggle) elements.modeToggle.checked = true;
      state.stats.hardWordsCount = fallback.originalHardWords.length;
      state.stats.simplifiedCount = Math.max(0, fallback.originalHardWords.length - fallback.rewrittenHardWords.length);
      updateStatistics();
      renderDocumentView();
      setPipelineStepState(1, 'complete');
      setPipelineStepState(2, 'complete');
      setPipelineStepState(3, 'complete');
      setPipelineStepState(4, 'complete');
      showToast('LLM unavailable. Showing local simplified fallback.');
    }
  }

  /* --------------------------------------------------------------------------
     7. STATISTICS CALCULATOR
     -------------------------------------------------------------------------- */

  function updateStatistics() {
    const text = state.rawText.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    const charCount = text.length;
    const readingTimeMin = Math.ceil(wordCount / 200);

    state.stats.words = wordCount;
    state.stats.chars = charCount;
    state.stats.readingTime = `${readingTimeMin} min`;

    // Calculate Memory Score (70 - 98 based on simplification progress)
    const baseScore = 65;
    const boost = state.stats.hardWordsCount > 0 
      ? Math.round((state.stats.simplifiedCount / state.stats.hardWordsCount) * 30)
      : 30;
    state.stats.memoryScore = Math.min(98, baseScore + boost);

    if (elements.statWords) elements.statWords.textContent = wordCount.toLocaleString();
    if (elements.statChars) elements.statChars.textContent = charCount.toLocaleString();
    if (elements.statReadingTime) elements.statReadingTime.textContent = `${readingTimeMin} min`;
    if (elements.statHardWords) elements.statHardWords.textContent = state.stats.hardWordsCount;
    if (elements.statSimplified) elements.statSimplified.textContent = state.stats.simplifiedCount;
    if (elements.statMemoryScore) elements.statMemoryScore.textContent = `${state.stats.memoryScore}%`;
    if (elements.scoreBarFill) elements.scoreBarFill.style.width = `${state.stats.memoryScore}%`;
  }

  /* --------------------------------------------------------------------------
     8. FLOATING SELECTION TOOLBAR & TOOLTIPS
     -------------------------------------------------------------------------- */

  let activeTooltipTarget = null;

  function positionHardWordTooltip(target) {
    if (!target || elements.wordTooltip.classList.contains('hidden')) return;

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = elements.wordTooltip.getBoundingClientRect();
    const viewportPadding = 12;
    const horizontalCenter = targetRect.left + (targetRect.width / 2);

    let left = horizontalCenter;
    left = Math.max(viewportPadding + (tooltipRect.width / 2), left);
    left = Math.min(window.innerWidth - viewportPadding - (tooltipRect.width / 2), left);

    let top = targetRect.bottom + 10;
    if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
      top = targetRect.top - tooltipRect.height - 10;
    }
    if (top < viewportPadding) {
      top = viewportPadding;
    }

    elements.wordTooltip.style.left = `${left}px`;
    elements.wordTooltip.style.top = `${top}px`;
  }

  function showHardWordTooltip(target) {
    activeTooltipTarget = target;
    const tooltipMsg = target.getAttribute('data-tooltip') || 'Can be simplified';
    const tooltipText = elements.wordTooltip.querySelector('.tooltip-text');
    if (tooltipText) tooltipText.textContent = tooltipMsg;
    elements.wordTooltip.classList.remove('hidden');
    positionHardWordTooltip(target);
  }

  function hideHardWordTooltip() {
    activeTooltipTarget = null;
    elements.wordTooltip.classList.add('hidden');
  }

  document.addEventListener('scroll', () => {
    if (activeTooltipTarget) {
      positionHardWordTooltip(activeTooltipTarget);
    }
  }, true);

  window.addEventListener('resize', () => {
    if (activeTooltipTarget) {
      positionHardWordTooltip(activeTooltipTarget);
    }
  });

  function attachWordEventListeners() {
    // Hover Tooltip for Hard Words & Simplified Words
    const wordSpans = document.querySelectorAll('.hard-word, .simplified-word');

    wordSpans.forEach(span => {
      span.addEventListener('mouseenter', () => showHardWordTooltip(span));
      span.addEventListener('mouseleave', hideHardWordTooltip);
    });
  }

  // Handle Text Selection Toolbar
  document.addEventListener('selectionchange', handleTextSelection);
  document.addEventListener('mouseup', handleTextSelection);

  function handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 2 && (elements.textContent.contains(selection.anchorNode) || elements.originalPaneContent.contains(selection.anchorNode))) {
      state.currentSelectionText = selectedText;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      elements.floatingToolbar.style.left = `${rect.left + rect.width / 2}px`;
      elements.floatingToolbar.style.top = `${rect.top}px`;
      elements.floatingToolbar.classList.remove('hidden');
    } else {
      setTimeout(() => {
        if (!window.getSelection().toString().trim()) {
          elements.floatingToolbar.classList.add('hidden');
        }
      }, 200);
    }
  }

  // Floating Toolbar Button Handlers
  elements.ftExplain.addEventListener('click', () => {
    sendQuickPrompt(`Explain this selected passage in super simple terms: "${state.currentSelectionText}"`);
    elements.floatingToolbar.classList.add('hidden');
  });

  elements.ftRewrite.addEventListener('click', () => {
    sendQuickPrompt(`Simplify and rewrite this specific paragraph: "${state.currentSelectionText}"`);
    elements.floatingToolbar.classList.add('hidden');
  });

  elements.ftMnemonic.addEventListener('click', () => {
    sendQuickPrompt(`Give me a clever, memorable mnemonic device to remember: "${state.currentSelectionText}"`);
    elements.floatingToolbar.classList.add('hidden');
  });

  elements.ftSummarize.addEventListener('click', () => {
    sendQuickPrompt(`Summarize this selection into 2 bullet points: "${state.currentSelectionText}"`);
    elements.floatingToolbar.classList.add('hidden');
  });

  elements.ftCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(state.currentSelectionText);
    showToast("Selection copied to clipboard!");
    elements.floatingToolbar.classList.add('hidden');
  });

  /* --------------------------------------------------------------------------
     9. SYNCHRONIZED SCROLLING IN COMPARE MODE
     -------------------------------------------------------------------------- */

  let isSyncingOrigScroll = false;
  let isSyncingSimpScroll = false;

  elements.originalPaneContent.addEventListener('scroll', () => {
    if (!isSyncingOrigScroll) {
      isSyncingSimpScroll = true;
      const percentage = elements.originalPaneContent.scrollTop / (elements.originalPaneContent.scrollHeight - elements.originalPaneContent.clientHeight);
      elements.simplifiedPaneContent.scrollTop = percentage * (elements.simplifiedPaneContent.scrollHeight - elements.simplifiedPaneContent.clientHeight);
    }
    isSyncingOrigScroll = false;
  });

  elements.simplifiedPaneContent.addEventListener('scroll', () => {
    if (!isSyncingSimpScroll) {
      isSyncingOrigScroll = true;
      const percentage = elements.simplifiedPaneContent.scrollTop / (elements.simplifiedPaneContent.scrollHeight - elements.simplifiedPaneContent.clientHeight);
      elements.originalPaneContent.scrollTop = percentage * (elements.originalPaneContent.scrollHeight - elements.originalPaneContent.clientHeight);
    }
    isSyncingSimpScroll = false;
  });

  /* --------------------------------------------------------------------------
     10. FILE UPLOAD & READERS (TXT, PDF, DOCX)
     -------------------------------------------------------------------------- */

  function triggerFileSelect() {
    elements.fileInput.click();
  }

  elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseUploadedFile(file);
  });

  // Drag and Drop
  const mainContent = document.querySelector('.main-content');

  mainContent.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropzoneOverlay.classList.add('drag-over');
  });

  elements.dropzoneOverlay.addEventListener('dragleave', () => {
    elements.dropzoneOverlay.classList.remove('drag-over');
  });

  elements.dropzoneOverlay.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropzoneOverlay.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      parseUploadedFile(e.dataTransfer.files[0]);
    }
  });

  function parseUploadedFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        loadDocument(fileNameWithoutExt, evt.target.result);
      };
      reader.readAsText(file);
    } else if (ext === 'pdf') {
      if (typeof pdfjsLib === 'undefined') {
        showToast("PDF parser library loading, please retry in a second.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        try {
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + "\n\n";
          }
          loadDocument(fileNameWithoutExt, fullText);
        } catch (err) {
          showToast("Error parsing PDF file.");
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (ext === 'docx') {
      if (typeof mammoth === 'undefined') {
        showToast("DOCX parser library loading, please retry in a second.");
        return;
      }
      const reader = new FileReader();
      reader.onload = function(evt) {
        const arrayBuffer = evt.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then(result => {
            loadDocument(fileNameWithoutExt, result.value);
          })
          .catch(err => {
            showToast("Error parsing DOCX file.");
            console.error(err);
          });
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast("Unsupported file format! Please upload PDF, DOCX, or TXT.");
    }
  }

  /* --------------------------------------------------------------------------
     11. SEARCH FUNCTIONALITY
     -------------------------------------------------------------------------- */

  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      state.searchQuery = query;

      if (!query) {
        if (elements.searchCount) elements.searchCount.textContent = '';
        if (elements.clearSearchBtn) elements.clearSearchBtn.hidden = true;
        renderDocumentView();
        return;
      }

      if (elements.clearSearchBtn) elements.clearSearchBtn.hidden = false;
      performSearch(query);
    });
  }

  if (elements.clearSearchBtn) {
    elements.clearSearchBtn.addEventListener('click', () => {
      if (elements.searchInput) elements.searchInput.value = '';
      state.searchQuery = '';
      if (elements.searchCount) elements.searchCount.textContent = '';
      elements.clearSearchBtn.hidden = true;
      renderDocumentView();
    });
  }

  function performSearch(query) {
    const regex = new RegExp(`(${query})`, 'gi');
    const nodes = elements.textContent.querySelectorAll('p');
    let matchCount = 0;

    nodes.forEach(p => {
      const text = p.textContent;
      if (regex.test(text)) {
        const count = (text.match(regex) || []).length;
        matchCount += count;
        p.innerHTML = text.replace(regex, `<mark class="search-highlight">$1</mark>`);
      }
    });

    elements.searchCount.textContent = `${matchCount} found`;
  }

  /* --------------------------------------------------------------------------
     12. AI STUDY CHAT & RESPONSE SIMULATOR
     -------------------------------------------------------------------------- */

  elements.chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMsg = elements.chatInput.value.trim();
    if (!userMsg) return;

    elements.chatInput.value = '';
    sendQuickPrompt(userMsg);
  });

  // Prompt Chips Click Handlers
  document.querySelectorAll('.prompt-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      sendQuickPrompt(promptText);
    });
  });

  function sendQuickPrompt(promptText) {
    appendChatMessage("You", promptText, true);

    // Show Typing Indicator
    const typingId = appendTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator(typingId);
      const aiReply = generateMockAIResponse(promptText);
      appendChatMessage("Memory AI", aiReply);
    }, 1200);
  }

  function appendChatMessage(sender, text, isUser = false) {
    if (!elements.chatMessages) {
      if (!isUser) {
        showToast(`AI Response: ${text.replace(/<[^>]*>?/gm, '').substring(0, 80)}...`);
      }
      return;
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    msgDiv.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid ${isUser ? 'fa-user' : 'fa-robot'}"></i></div>
      <div class="msg-content glass-card">
        <p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>
        <div class="msg-time">${timeStr}</div>
      </div>
    `;

    elements.chatMessages.appendChild(msgDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }

  function appendTypingIndicator() {
    if (!elements.chatMessages) return null;
    const id = `typing-${Date.now()}`;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ai-message';
    msgDiv.id = id;
    msgDiv.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="msg-content glass-card">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    elements.chatMessages.appendChild(msgDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    const elem = document.getElementById(id);
    if (elem) elem.remove();
  }

  function generateMockAIResponse(userPrompt) {
    const lower = userPrompt.toLowerCase();

    if (lower.includes("explain") || lower.includes("paragraph")) {
      return `### Simple Breakdown 💡\n\nThis passage explains how cells generate energy and communicate:\n1. **Cells have internal power plants** called mitochondria that convert food and oxygen into usable chemical energy (ATP).\n2. **Brain cells (neurons)** send electric signals along their long wire-like axons.\n3. **When the electrical signal reaches the end**, chemical messengers jump across a tiny gap (synapses) to pass the message to the next cell.`;
    }

    if (lower.includes("mnemonic")) {
      return `### 🧠 Memory Trick / Mnemonic:\n\nTo remember **Mitochondria = Powerhouse**:\n\n👉 **"MIGHTY MIGHTY MITOCHONDRIA MAKES MULTIPLE MEGA-WATTS!"**\n\nTo remember **Neuron Signal Path**:\n👉 **D-A-S** (*Dendrite receives -> Axon transmits -> Synapse releases*)`;
    }

    if (lower.includes("summarize") || lower.includes("takeaways")) {
      return `### 📋 Key Executive Takeaways:\n• **Mitochondria** = Primary energy factories producing ATP.\n• **Action Potential** = Electrical nerve impulse traveling along nerve fibers.\n• **Neuroplasticity** = The brain's superpower to prune weak paths and strengthen active neural connections.`;
    }

    if (lower.includes("flashcard")) {
      openFlashcardsModal();
      return `I have opened your **Interactive Study Flashcards** deck! Click through the cards above to test your recall on key terms.`;
    }

    if (lower.includes("quiz")) {
      openQuizModal();
      return `Starting your **Interactive Practice Quiz**! Select your answers in the popup drawer to test your understanding.`;
    }

    const referenceHardWords = state.pipelineResults?.originalHardWords?.length
      ? state.pipelineResults.originalHardWords
      : state.hardWordsList;
    const firstHardWordEntry = referenceHardWords[0];
    const firstHardWord = typeof firstHardWordEntry === 'string' ? firstHardWordEntry : firstHardWordEntry?.original;
    const firstSimplifiedWord = typeof firstHardWordEntry === 'string' ? firstHardWordEntry : firstHardWordEntry?.simplified;

    return `Based on your loaded document **"${state.docTitle}"**:\n\nThe core concept involves how complex biological systems optimize efficiency. By simplifying technical jargon like *"${firstHardWord || 'mitochondria'}"* into *"${firstSimplifiedWord || 'energy factory'}"*, your brain retains the structural logic **40% faster**! Ask me for flashcards or mnemonics anytime.`;
  }

  /* --------------------------------------------------------------------------
     13. INTERACTIVE FLASHCARDS & QUIZ MODALS
     -------------------------------------------------------------------------- */

  const SAMPLE_FLASHCARDS = [
    {
      q: "What is the primary role of the mitochondria in cellular biology?",
      a: "The mitochondria acts as the power station of the cell, converting oxygen and nutrients into ATP energy through cellular respiration."
    },
    {
      q: "What is an Action Potential in nerve cells?",
      a: "An electrical impulse that rapidly travels down a neuron's axon to transmit information throughout the nervous system."
    },
    {
      q: "What is Neuroplasticity?",
      a: "The brain's ability to reorganize itself by forming new neural connections and pruning unused pathways throughout life."
    },
    {
      q: "What is Quantum Superposition?",
      a: "A principle in quantum physics where a physical system exists in multiple potential states simultaneously until measured."
    }
  ];

  function openFlashcardsModal() {
    state.flashcardIndex = 0;
    updateFlashcardUI();
    elements.flashcardsModal.classList.remove('hidden');
  }

  function updateFlashcardUI() {
    const fc = SAMPLE_FLASHCARDS[state.flashcardIndex];
    if (elements.fcQuestion) elements.fcQuestion.textContent = fc.q;
    if (elements.fcAnswer) elements.fcAnswer.textContent = fc.a;
    if (elements.fcCounter) elements.fcCounter.textContent = `${state.flashcardIndex + 1} / ${SAMPLE_FLASHCARDS.length}`;
    if (elements.flashcardElement) elements.flashcardElement.classList.remove('flipped');
  }

  if (elements.flashcardElement) {
    elements.flashcardElement.addEventListener('click', () => {
      elements.flashcardElement.classList.toggle('flipped');
    });
  }

  if (elements.btnFcNext) {
    elements.btnFcNext.addEventListener('click', () => {
      state.flashcardIndex = (state.flashcardIndex + 1) % SAMPLE_FLASHCARDS.length;
      updateFlashcardUI();
    });
  }

  if (elements.btnFcPrev) {
    elements.btnFcPrev.addEventListener('click', () => {
      state.flashcardIndex = (state.flashcardIndex - 1 + SAMPLE_FLASHCARDS.length) % SAMPLE_FLASHCARDS.length;
      updateFlashcardUI();
    });
  }

  if (elements.btnLaunchFlashcards) elements.btnLaunchFlashcards.addEventListener('click', openFlashcardsModal);
  if (elements.closeFlashcardsModal) {
    elements.closeFlashcardsModal.addEventListener('click', () => {
      elements.flashcardsModal.classList.add('hidden');
    });
  }

  // QUIZ LOGIC
  const SAMPLE_QUIZ = [
    {
      q: "Which organelle generates ATP energy for eukaryotic cells?",
      options: ["Endoplasmic Reticulum", "Mitochondria", "Golgi Apparatus", "Lysosome"],
      answer: 1
    },
    {
      q: "What carries nerve signals across the synaptic gap?",
      options: ["Neurotransmitters", "Red Blood Cells", "Lipids", "Amino Acids"],
      answer: 0
    },
    {
      q: "What term describes the brain's ability to rewire its neural pathways?",
      options: ["Photosynthesis", "Homeostasis", "Neuroplasticity", "Glycolysis"],
      answer: 2
    }
  ];

  function openQuizModal() {
    state.quizIndex = 0;
    state.quizScore = 0;
    renderQuizQuestion();
    elements.quizModal.classList.remove('hidden');
  }

  function renderQuizQuestion() {
    const qData = SAMPLE_QUIZ[state.quizIndex];
    elements.quizQNum.textContent = `Question ${state.quizIndex + 1} of ${SAMPLE_QUIZ.length}`;
    elements.quizQTitle.textContent = qData.q;
    elements.quizProgressFill.style.width = `${((state.quizIndex + 1) / SAMPLE_QUIZ.length) * 100}%`;

    elements.quizOptions.innerHTML = qData.options.map((opt, i) => `
      <button class="quiz-opt-btn" data-index="${i}">${opt}</button>
    `).join('');

    const optBtns = elements.quizOptions.querySelectorAll('.quiz-opt-btn');
    optBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedIdx = parseInt(btn.getAttribute('data-index'), 10);
        optBtns.forEach(b => b.disabled = true);
        if (selectedIdx === qData.answer) {
          btn.classList.add('correct');
          state.quizScore++;
        } else {
          btn.classList.add('incorrect');
          optBtns[qData.answer].classList.add('correct');
        }
      });
    });
  }

  if (elements.btnQuizNext) {
    elements.btnQuizNext.addEventListener('click', () => {
      if (state.quizIndex < SAMPLE_QUIZ.length - 1) {
        state.quizIndex++;
        renderQuizQuestion();
      } else {
        showToast(`Quiz completed! You scored ${state.quizScore} / ${SAMPLE_QUIZ.length}`);
        elements.quizModal.classList.add('hidden');
      }
    });
  }

  if (elements.btnLaunchQuiz) elements.btnLaunchQuiz.addEventListener('click', openQuizModal);
  if (elements.closeQuizModal) {
    elements.closeQuizModal.addEventListener('click', () => {
      elements.quizModal.classList.add('hidden');
    });
  }

  /* --------------------------------------------------------------------------
     14. EXPORT & COPY CONTROLS
     -------------------------------------------------------------------------- */

  if (elements.btnCopyOutput) {
    elements.btnCopyOutput.addEventListener('click', () => {
      const exportText = state.viewMode === "simplified"
        ? elements.textContent.innerText
        : state.rawText;

      navigator.clipboard.writeText(exportText);
      showToast("Document text copied to clipboard!");
    });
  }

  if (elements.btnExportDropdown) {
    elements.btnExportDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      if (elements.exportMenu) elements.exportMenu.classList.toggle('hidden');
    });
  }

  document.addEventListener('click', () => {
    if (elements.exportMenu) elements.exportMenu.classList.add('hidden');
  });

  if (elements.btnExportTxt) {
    elements.btnExportTxt.addEventListener('click', () => {
      const textToSave = state.textContent ? elements.textContent.innerText : state.rawText;
      const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${state.docTitle.replace(/\s+/g, '_')}_Simplified.txt`;
      link.click();
      showToast("Exported TXT file!");
    });
  }

  if (elements.btnExportPdf) {
    elements.btnExportPdf.addEventListener('click', () => {
      window.print();
    });
  }

  if (elements.btnPrint) {
    elements.btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  /* --------------------------------------------------------------------------
     15. MODAL EVENT LISTENERS & UI SWITCHES
     -------------------------------------------------------------------------- */

  // Sidebar Presets
  if (elements.sessionList) {
    elements.sessionList.querySelectorAll('.session-item').forEach(item => {
      item.addEventListener('click', () => {
        elements.sessionList.querySelectorAll('.session-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const presetKey = item.getAttribute('data-preset');
        const presetData = PRESET_DOCUMENTS[presetKey];
        if (presetData) {
          loadDocument(presetData.title, presetData.text);
        }
      });
    });
  }

  // Mode Toggle (Original vs Simplified)
  if (elements.modeToggle) {
    elements.modeToggle.addEventListener('change', (e) => {
      state.viewMode = e.target.checked ? "simplified" : "original";
      if (state.viewMode === "simplified" && !state.isRewritten) {
        executeRewrite();
      } else {
        renderDocumentView();
      }
    });
  }

  // Compare View Toggle
  if (elements.btnCompare) {
    elements.btnCompare.addEventListener('click', () => {
      state.isCompareMode = !state.isCompareMode;
      if (state.isCompareMode) {
        elements.singleViewer.classList.add('hidden');
        elements.compareViewer.classList.remove('hidden');
        elements.btnCompare.classList.add('btn-primary');
        elements.btnCompare.classList.remove('btn-outline');
        showToast("Side-by-side comparison mode activated!");
      } else {
        elements.singleViewer.classList.remove('hidden');
        elements.compareViewer.classList.add('hidden');
        elements.btnCompare.classList.remove('btn-primary');
        elements.btnCompare.classList.add('btn-outline');
      }
    });
  }

  // Upload Buttons
  [elements.btnSidebarUpload, elements.btnHeaderUpload, elements.btnBottomUpload].forEach(btn => {
    if (btn) btn.addEventListener('click', triggerFileSelect);
  });

  // New Session Button
  if (elements.btnNewSession) {
    elements.btnNewSession.addEventListener('click', () => {
      loadDocument("New Study Note", "Paste or upload your study text here to begin simplifying technical jargon.");
    });
  }

  // Clear Button
  if (elements.btnClear) {
    elements.btnClear.addEventListener('click', () => {
      loadDocument("Untitled Document", "");
    });
  }

  // Rewrite Button
  elements.btnRewrite.addEventListener('click', () => {
    executeRewrite();
  });

  // Font Size Adjustments
  elements.btnIncreaseFont.addEventListener('click', () => {
    if (state.fontSize < 24) {
      state.fontSize += 2;
      renderDocumentView();
    }
  });

  elements.btnDecreaseFont.addEventListener('click', () => {
    if (state.fontSize > 12) {
      state.fontSize -= 2;
      renderDocumentView();
    }
  });

  // Paste Text Modal
  elements.btnHeaderPaste.addEventListener('click', () => {
    openPasteModal();
  });

  elements.cancelPasteBtn.addEventListener('click', () => {
    closePasteModal();
  });

  if (elements.pasteClipboardBtn) {
    elements.pasteClipboardBtn.addEventListener('click', async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        elements.pasteTextarea.value = clipboardText;
        elements.pasteTextarea.focus({ preventScroll: true });
        elements.pasteTextarea.setSelectionRange(clipboardText.length, clipboardText.length);
        showToast('Clipboard text inserted into the box.');
      } catch (error) {
        console.error(error);
        showToast('Clipboard paste is blocked by the browser. Use Ctrl+V inside the box.');
      }
    });
  }

  elements.closePasteModal.addEventListener('click', () => {
    closePasteModal();
  });

  elements.confirmPasteBtn.addEventListener('click', () => {
    const text = elements.pasteTextarea.value.trim();
    if (text) {
      loadDocument("Pasted Document", text);
      closePasteModal();
      elements.pasteTextarea.value = '';
    }
  });

  // Settings Modal
  elements.btnSettings.addEventListener('click', () => {
    elements.settingsModal.classList.remove('hidden');
  });

  elements.closeSettingsModal.addEventListener('click', () => {
    elements.settingsModal.classList.add('hidden');
  });

  elements.saveSettingsBtn.addEventListener('click', () => {
    state.sensitivity = document.getElementById('sensitivitySelect').value;
    state.animSpeed = document.getElementById('animSpeedSelect').value;
    saveApiConfig();
    elements.settingsModal.classList.add('hidden');
    showToast("Preferences saved!");
  });

  // Mobile Menu Sidebar Toggle
  elements.mobileMenuBtn.addEventListener('click', () => {
    elements.sidebar.classList.add('mobile-open');
  });

  elements.closeSidebarBtn.addEventListener('click', () => {
    elements.sidebar.classList.remove('mobile-open');
  });

  // Helper Toast
  function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');
    setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 3000);
  }

  /* --------------------------------------------------------------------------
     16. INITIALIZATION
     -------------------------------------------------------------------------- */
  function init() {
    loadApiConfig();
    // Load initial biology preset
    const defaultDoc = PRESET_DOCUMENTS.biology;
    loadDocument(defaultDoc.title, defaultDoc.text);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
