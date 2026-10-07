/* ==========================================================================
   LexiClear AI - Clause Analyzer & Rewriter JavaScript Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // --- Data State ---
  let currentFile = null;
  let rawText = '';
  let clauses = []; // [{ id, originalText, rewrittenText, complexity, wordCount, grade, jargonTerms, isRewritten }]
  let currentFilter = 'all'; // 'all', 'red', 'yellow', 'green'
  let currentViewMode = 'highlighted'; // 'highlighted', 'diff'
  let activeModalClauseId = null;

  // --- DOM Elements ---
  const fileInput = document.getElementById('file-input');
  const dropzone = document.getElementById('dropzone');
  const fileInfoBadge = document.getElementById('file-info-badge');
  const fileNameText = document.getElementById('file-name-text');
  const btnRemoveFile = document.getElementById('btn-remove-file');
  const textInput = document.getElementById('text-input');
  const charCountLabel = document.getElementById('char-count');
  const btnClearText = document.getElementById('btn-clear-text');
  const sampleSelector = document.getElementById('sample-selector');
  const btnDemoData = document.getElementById('btn-demo-data');
  const btnReset = document.getElementById('btn-reset');

  const btnAnalyze = document.getElementById('btn-analyze');
  const btnRewrite = document.getElementById('btn-rewrite');
  
  const scoreRing = document.getElementById('score-ring');
  const scoreValue = document.getElementById('score-value');
  const scoreStatusBadge = document.getElementById('score-status-badge');
  const scoreStatusText = document.getElementById('score-status-text');
  const scoreDescription = document.getElementById('score-description');

  const distPercentageText = document.getElementById('dist-percentage-text');
  const barRed = document.getElementById('bar-red');
  const barYellow = document.getElementById('bar-yellow');
  const barGreen = document.getElementById('bar-green');

  const filterPills = document.querySelectorAll('.filter-pills .pill');
  const viewHighlightedBtn = document.getElementById('view-highlighted');
  const viewDiffBtn = document.getElementById('view-diff');

  const emptyState = document.getElementById('empty-state');
  const highlightedContent = document.getElementById('highlighted-content');
  const diffContent = document.getElementById('diff-content');
  const diffOriginalList = document.getElementById('diff-original-list');
  const diffRewrittenList = document.getElementById('diff-rewritten-list');

  const rewrittenStatusTag = document.getElementById('rewritten-status-tag');
  const btnCopyRewritten = document.getElementById('btn-copy-rewritten');
  const btnDownloadTxt = document.getElementById('btn-download-txt');

  // Modal elements
  const clauseModal = document.getElementById('clause-modal');
  const modalDifficultyBadge = document.getElementById('modal-difficulty-badge');
  const modalClauseTitle = document.getElementById('modal-clause-title');
  const modalOriginalText = document.getElementById('modal-original-text');
  const modalWordCount = document.getElementById('modal-word-count');
  const modalReadability = document.getElementById('modal-readability');
  const modalJargonCount = document.getElementById('modal-jargon-count');
  const modalJargonTags = document.getElementById('modal-jargon-tags');
  const modalRewrittenText = document.getElementById('modal-rewritten-text');
  const btnModalRewriteSingle = document.getElementById('btn-modal-rewrite-single');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnModalClose = document.getElementById('btn-modal-close');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- Sample Legal Documents Library ---
  const SAMPLE_DOCS = {
    nda: `NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

Confidentiality Obligation. The Receiving Party agrees that it shall hold in strict confidence and shall not disclose, divulge, publish, or otherwise reveal any Confidential Information received from the Disclosing Party to any third party whatsoever without the prior written consent of the Disclosing Party.

Definition of Information. Confidential Information shall include, without limitation, all trade secrets, technical specifications, source code, financial data, business strategies, customer lists, and proprietary know-how disclosed hereinafter.

Limitation of Liability and Indemnification. Notwithstanding anything contained herein to the contrary, the Receiving Party shall indemnify, defend, and hold harmless the Disclosing Party and its officers, directors, and employees from and against any and all claims, liabilities, damages, losses, or expenses, including reasonable attorney fees, arising out of or in connection with any breach of this Agreement.

Term and Termination. This Agreement and the obligations set forth herein shall remain in full force and effect for a period of five (5) years commencing from the effective date hereof, after which all confidentiality restrictions shall expire.

Governing Law and Severability. This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of Delaware. In the event that any provision of this Agreement is held to be invalid or unenforceable, such provision shall be severed and the remaining provisions shall continue in full force.`,

    tos: `TERMS OF SERVICE AND USER AGREEMENT

Acceptance of Terms. By accessing or utilizing the SaaS Services, you irrevocably agree to be bound by these Terms of Service. If you do not agree, you are prohibited from using the platform.

Auto-Renewal and Billing. Subscriptions shall automatically renew for successive one-year periods unless written notice of cancellation is received thirty (30) days prior to renewal date. All fees paid hereunder are non-refundable under any circumstances.

Mandatory Binding Arbitration. Any dispute, claim, or controversy arising out of or relating to this Agreement shall be settled exclusively through final and binding arbitration administered by the American Arbitration Association, and you hereby waive your right to a trial by jury or participation in a class action lawsuit.

Service Availability. We strive for 99.9% uptime; however, we do not warrant that the service will be uninterrupted or error-free.`,

    privacy: `PRIVACY & DATA PROCESSING POLICY

Collection of Data. We collect personally identifiable information (PII) including IP addresses, browser fingerprints, and device analytics to optimize application performance.

Third-Party Data Sharing. We may disclose your personal data to trusted third-party vendors, sub-processors, and cloud infrastructure providers located in international jurisdictions for marketing, analytics, and service maintenance purposes.

User Privacy Rights. Subject to applicable laws such as GDPR and CCPA, users possess the right to request deletion or modification of their stored personal data by submitting a formal request via email.`,

    license: `SOFTWARE LICENSE & WARRANTY DISCLAIMER

License Grant. Subject to compliance with these terms, the Licensor hereby grants to the Licensee a non-exclusive, non-transferable, revocable license to install and execute the Software solely for internal business operations.

Warranty Disclaimer. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM OR DAMAGES.`
  };

  // --- Legalese Dictionary & Jargon Rules ---
  const LEGALESE_TERMS = [
    'hereinafter', 'disclosing party', 'receiving party', 'indemnify', 'hold harmless',
    'notwithstanding', 'set forth', 'severability', 'irrevocable', 'prejudice',
    'consequential damages', 'liquidated damages', 'inter alia', 'force majeure',
    'without limitation', 'under any circumstances', 'arising out of', 'in accordance with',
    'commencing from', 'full force and effect', 'express or implied', 'merchantability',
    'non-transferable', 'sub-processors', 'non-refundable', 'jurisdiction'
  ];

  // --- Event Listeners Initialization ---

  sampleSelector.addEventListener('change', (e) => {
    const val = e.target.value;
    if (SAMPLE_DOCS[val]) {
      loadText(SAMPLE_DOCS[val]);
      showToast(`Loaded sample: ${sampleSelector.options[sampleSelector.selectedIndex].text}`);
    }
  });

  btnDemoData.addEventListener('click', () => {
    sampleSelector.value = 'nda';
    loadText(SAMPLE_DOCS.nda);
    showToast('Loaded Sample NDA Contract');
  });

  btnReset.addEventListener('click', resetAll);

  // File Upload Handlers
  dropzone.addEventListener('click', () => fileInput.click());
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  });

  btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    removeUploadedFile();
  });

  // Textarea Input Listener
  textInput.addEventListener('input', () => {
    updateWordCountDisplay();
  });

  btnClearText.addEventListener('click', () => {
    textInput.value = '';
    updateWordCountDisplay();
    showToast('Text cleared');
  });

  // Action Buttons
  btnAnalyze.addEventListener('click', () => {
    const textToAnalyze = textInput.value.trim();
    if (!textToAnalyze) {
      showToast('Please enter text or upload a document first!', 'warning');
      return;
    }
    analyzeTextDocument(textToAnalyze);
  });

  btnRewrite.addEventListener('click', () => {
    if (clauses.length === 0) return;
    rewriteAllDifficultClauses();
  });

  // Filter Pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderClauseViews();
    });
  });

  // View Mode Toggles
  viewHighlightedBtn.addEventListener('click', () => {
    viewHighlightedBtn.classList.add('active');
    viewDiffBtn.classList.remove('active');
    currentViewMode = 'highlighted';
    highlightedContent.classList.remove('hidden');
    diffContent.classList.add('hidden');
  });

  viewDiffBtn.addEventListener('click', () => {
    viewDiffBtn.classList.add('active');
    viewHighlightedBtn.classList.remove('active');
    currentViewMode = 'diff';
    diffContent.classList.remove('hidden');
    highlightedContent.classList.add('hidden');
  });

  // Export Utilities
  btnCopyRewritten.addEventListener('click', () => {
    const textToCopy = getFinalText();
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Copied text to clipboard!');
    });
  });

  btnDownloadTxt.addEventListener('click', () => {
    const textToDownload = getFinalText();
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simplified-document-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded simplified .txt document!');
  });

  // Modal Listeners
  [btnCloseModal, btnModalClose].forEach(b => b.addEventListener('click', closeModal));
  clauseModal.addEventListener('click', (e) => {
    if (e.target === clauseModal) closeModal();
  });

  btnModalRewriteSingle.addEventListener('click', () => {
    if (activeModalClauseId !== null) {
      rewriteSingleClause(activeModalClauseId);
      closeModal();
    }
  });

  // --- Helper Functions ---

  function loadText(text) {
    textInput.value = text;
    removeUploadedFile();
    updateWordCountDisplay();
    analyzeTextDocument(text);
  }

  function updateWordCountDisplay() {
    const text = textInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    charCountLabel.textContent = `${words} words`;
  }

  function removeUploadedFile() {
    currentFile = null;
    fileInput.value = '';
    fileInfoBadge.classList.add('hidden');
    dropzone.querySelector('.dropzone-content').classList.remove('hidden');
  }

  function handleFileUpload(file) {
    currentFile = file;
    fileNameText.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    dropzone.querySelector('.dropzone-content').classList.add('hidden');
    fileInfoBadge.classList.remove('hidden');

    const ext = file.name.split('.').pop().toLowerCase();
    showToast(`Reading file: ${file.name}...`);

    if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = (e) => loadText(e.target.result);
      reader.readAsText(file);
    } else if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then(result => loadText(result.value))
          .catch(err => {
            console.error(err);
            showToast('Error parsing DOCX file!', 'error');
          });
      };
      reader.readAsArrayBuffer(file);
    } else if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = function () {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
          let maxPages = pdf.numPages;
          let countPromises = [];
          for (let j = 1; j <= maxPages; j++) {
            countPromises.push(
              pdf.getPage(j).then(page => page.getTextContent().then(content => {
                return content.items.map(item => item.str).join(' ');
              }))
            );
          }
          Promise.all(countPromises).then(pagesText => {
            loadText(pagesText.join('\n\n'));
          });
        }).catch(err => {
          console.error(err);
          showToast('Error parsing PDF file!', 'error');
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast('Unsupported file format!', 'error');
    }
  }

  // --- Clause Extraction & Classification Engine ---

  function analyzeTextDocument(text) {
    rawText = text;
    rewrittenStatusTag.classList.add('hidden');

    const paragraphBlocks = text.split(/\n+/).filter(p => p.trim().length > 0);
    clauses = [];
    let idCounter = 1;

    paragraphBlocks.forEach(para => {
      // Split sentences by punctuation (.!?;)
      const rawSentences = para.match(/[^.!?;\n]+[.!?;\n]+/g) || [para];
      
      rawSentences.forEach(s => {
        const cleanStr = s.trim();
        if (cleanStr.length > 5 && !/^\d+\.$/.test(cleanStr)) {
          const analysis = analyzeClauseComplexity(cleanStr);
          clauses.push({
            id: idCounter++,
            originalText: cleanStr,
            rewrittenText: generateSimplifiedRewrite(cleanStr),
            complexity: analysis.complexity, // 'red', 'yellow', 'green'
            wordCount: analysis.wordCount,
            grade: analysis.grade,
            jargonTerms: analysis.jargonTerms,
            isRewritten: false
          });
        }
      });
    });

    updateDashboardMetrics();
    renderClauseViews();

    btnRewrite.disabled = clauses.length === 0;
    btnCopyRewritten.disabled = clauses.length === 0;
    btnDownloadTxt.disabled = clauses.length === 0;

    emptyState.classList.add('hidden');
    if (currentViewMode === 'highlighted') {
      highlightedContent.classList.remove('hidden');
    } else {
      diffContent.classList.remove('hidden');
    }

    showToast(`Analyzed ${clauses.length} clauses successfully!`);
  }

  function analyzeClauseComplexity(str) {
    const lower = str.toLowerCase();
    const words = str.split(/\s+/).length;
    
    // Find detected legal jargon terms
    const detectedJargon = LEGALESE_TERMS.filter(term => lower.includes(term));
    
    let complexity = 'green';
    let grade = 'Standard Clear';

    const possessesHeavyConditionals = (lower.match(/\b(provided that|notwithstanding|in the event|without limitation|shall be|whereof|hereof|thereof)\b/g) || []).length;

    if (words > 25 || detectedJargon.length >= 2 || possessesHeavyConditionals >= 2) {
      complexity = 'red';
      grade = 'Dense Legalese';
    } else if (words >= 15 || detectedJargon.length === 1 || possessesHeavyConditionals === 1) {
      complexity = 'yellow';
      grade = 'Complex Phrasing';
    } else {
      complexity = 'green';
      grade = 'Clear Language';
    }

    return {
      complexity,
      wordCount: words,
      grade,
      jargonTerms: detectedJargon
    };
  }

  // --- Algorithmic & Dictionary Simplifier Engine ---

  function generateSimplifiedRewrite(str) {
    let simplified = str;

    const replacements = [
      { regex: /the receiving party agrees that it shall hold in strict confidence and shall not disclose, divulge, publish, or otherwise reveal any confidential information/gi, replace: "The Receiving Party agrees to keep all Confidential Information private and not share it" },
      { regex: /notwithstanding anything contained herein to the contrary/gi, replace: "Regardless of any other terms" },
      { regex: /shall indemnify, defend, and hold harmless/gi, replace: "will cover any legal expenses or losses caused to" },
      { regex: /arising out of or in connection with any breach of this agreement/gi, replace: "resulting from breaking this contract" },
      { regex: /for a period of five \(5\) years commencing from the effective date hereof/gi, replace: "for 5 years starting from the effective date" },
      { regex: /shall remain in full force and effect/gi, replace: "remains active" },
      { regex: /shall be governed by, construed, and enforced in accordance with/gi, replace: "follows" },
      { regex: /in the event that any provision of this agreement is held to be invalid or unenforceable/gi, replace: "If any part of this contract is ruled invalid" },
      { regex: /such provision shall be severed and the remaining provisions shall continue in full force/gi, replace: "that part will be removed while the rest stays in effect" },
      { regex: /by accessing or utilizing the saas services, you irrevocably agree to be bound by these terms/gi, replace: "By using our service, you agree to follow these Terms" },
      { regex: /subscriptions shall automatically renew for successive one-year periods unless written notice of cancellation is received/gi, replace: "Subscriptions renew automatically every year unless you cancel in writing" },
      { regex: /all fees paid hereunder are non-refundable under any circumstances/gi, replace: "All payments are non-refundable" },
      { regex: /settled exclusively through final and binding arbitration/gi, replace: "handled through private arbitration" },
      { regex: /you hereby waive your right to a trial by jury or participation in a class action lawsuit/gi, replace: "you give up the right to a court jury or class-action lawsuit" },
      { regex: /the software is provided "as is", without warranty of any kind, express or implied/gi, replace: "The software is provided as-is without any warranties" },
      { regex: /in no event shall the authors be liable for any claim or damages/gi, replace: "The authors are not responsible for any damages" },
      { regex: /\bshall be\b/gi, replace: "is" },
      { regex: /\bshall\b/gi, replace: "will" },
      { regex: /\bhereinafter\b/gi, replace: "below" },
      { regex: /\bwithout limitation\b/gi, replace: "including" },
      { regex: /\bin the event that\b/gi, replace: "if" },
      { regex: /\bprior to\b/gi, replace: "before" }
    ];

    replacements.forEach(item => {
      simplified = simplified.replace(item.regex, item.replace);
    });

    if (simplified === str && str.split(/\s+/).length > 25) {
      simplified = str.replace(/, containing [^,]+,/gi, '');
      simplified = simplified.replace(/; provided, however, that/gi, '. However,');
    }

    return simplified;
  }

  // --- Memorability Score & Dashboard Metrics Computation ---

  function updateDashboardMetrics() {
    if (clauses.length === 0) {
      resetGauge();
      return;
    }

    const total = clauses.length;
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    clauses.forEach(c => {
      const activeComp = c.isRewritten ? 'green' : c.complexity;
      if (activeComp === 'red') redCount++;
      else if (activeComp === 'yellow') yellowCount++;
      else greenCount++;
    });

    const redPct = ((redCount / total) * 100).toFixed(1);
    const yellowPct = ((yellowCount / total) * 100).toFixed(1);
    const greenPct = ((greenCount / total) * 100).toFixed(1);

    barRed.style.width = `${redPct}%`;
    barYellow.style.width = `${yellowPct}%`;
    barGreen.style.width = `${greenPct}%`;

    const simplifiedPct = Math.round((greenCount / total) * 100);
    distPercentageText.textContent = `${simplifiedPct}% Simplified`;

    let score = 100 - ((redCount * 65 + yellowCount * 35) / total);
    score = Math.max(12, Math.min(100, Math.round(score)));

    animateScoreGauge(score);
  }

  function animateScoreGauge(targetScore) {
    scoreValue.textContent = targetScore;

    const circumference = 326.72;
    const offset = circumference - (targetScore / 100) * circumference;
    scoreRing.style.strokeDashoffset = offset;

    scoreStatusBadge.className = 'score-status-badge';

    if (targetScore >= 80) {
      scoreRing.style.stroke = 'var(--green-accent)';
      scoreStatusBadge.classList.add('green');
      scoreStatusText.textContent = 'High Memorability';
      scoreDescription.textContent = 'Clauses are clear, concise, and easily understandable.';
    } else if (targetScore >= 55) {
      scoreRing.style.stroke = 'var(--yellow-accent)';
      scoreStatusBadge.classList.add('yellow');
      scoreStatusText.textContent = 'Moderate Memorability';
      scoreDescription.textContent = 'Contains several complex clauses. Simplifying will improve reader comprehension.';
    } else {
      scoreRing.style.stroke = 'var(--red-accent)';
      scoreStatusBadge.classList.add('red');
      scoreStatusText.textContent = 'Low Memorability';
      scoreDescription.textContent = 'Heavy legalese and dense phrasing reduce reader retention.';
    }
  }

  function resetGauge() {
    scoreValue.textContent = '--';
    scoreRing.style.strokeDashoffset = 326.72;
    scoreRing.style.stroke = 'var(--primary)';
    scoreStatusBadge.className = 'score-status-badge';
    scoreStatusText.textContent = 'Awaiting Analysis';
    scoreDescription.textContent = 'Upload or paste a document to compute readability & clause clarity score.';

    barRed.style.width = '0%';
    barYellow.style.width = '0%';
    barGreen.style.width = '100%';
    distPercentageText.textContent = '0% Simplified';
  }

  // --- Rendering Functions ---

  function renderClauseViews() {
    if (clauses.length === 0) return;

    const filteredClauses = clauses.filter(c => {
      const activeComp = c.isRewritten ? 'green' : c.complexity;
      if (currentFilter === 'all') return true;
      return activeComp === currentFilter;
    });

    // Render Highlighted View
    highlightedContent.innerHTML = '';
    let currentPara = document.createElement('div');
    currentPara.className = 'clause-paragraph';

    filteredClauses.forEach(c => {
      const span = document.createElement('span');
      const activeComp = c.isRewritten ? 'green' : c.complexity;
      const displayText = c.isRewritten ? c.rewrittenText : c.originalText;

      span.className = `clause-span clause-${activeComp} ${c.isRewritten ? 'is-rewritten' : ''}`;
      span.setAttribute('data-id', c.id);

      // Clean text without numbers or hard/hardest/easy text tags
      span.innerHTML = `${displayText} `;
      span.addEventListener('click', () => openClauseModal(c.id));
      currentPara.appendChild(span);
    });

    highlightedContent.appendChild(currentPara);

    // Render Side-by-Side Diff View (clean text without #1 numbers)
    diffOriginalList.innerHTML = '';
    diffRewrittenList.innerHTML = '';

    filteredClauses.forEach(c => {
      const origItem = document.createElement('div');
      origItem.className = `diff-item ${c.complexity}`;
      origItem.innerHTML = c.originalText;

      const rewItem = document.createElement('div');
      rewItem.className = `diff-item ${c.isRewritten ? 'green' : c.complexity}`;
      rewItem.innerHTML = c.rewrittenText;

      diffOriginalList.appendChild(origItem);
      diffRewrittenList.appendChild(rewItem);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- Clause Rewriting Actions ---

  function rewriteAllDifficultClauses() {
    let rewrittenCount = 0;
    clauses.forEach(c => {
      if (c.complexity === 'red' || c.complexity === 'yellow') {
        c.isRewritten = true;
        rewrittenCount++;
      }
    });

    rewrittenStatusTag.classList.remove('hidden');
    
    updateDashboardMetrics();
    renderClauseViews();

    showToast(`✨ Successfully rewritten ${rewrittenCount} difficult clauses!`);
  }

  function rewriteSingleClause(id) {
    const clause = clauses.find(c => c.id === id);
    if (clause) {
      clause.isRewritten = true;
      updateDashboardMetrics();
      renderClauseViews();
      showToast(`Rewritten Clause`);
    }
  }

  function getFinalText() {
    return clauses.map(c => c.isRewritten ? c.rewrittenText : c.originalText).join(' ');
  }

  // --- Modal Inspector ---

  function openClauseModal(id) {
    const clause = clauses.find(c => c.id === id);
    if (!clause) return;

    activeModalClauseId = id;
    modalClauseTitle.textContent = `Clause Inspector`;
    modalOriginalText.textContent = clause.originalText;
    modalRewrittenText.textContent = clause.rewrittenText;

    const activeComp = clause.isRewritten ? 'green' : clause.complexity;
    modalDifficultyBadge.className = `badge-diff ${activeComp}`;
    modalDifficultyBadge.textContent = clause.isRewritten ? 'Simplified' : (clause.complexity === 'red' ? 'Complex Clause' : 'Moderate Clause');

    modalWordCount.textContent = `${clause.wordCount} words`;
    modalReadability.textContent = clause.grade;
    modalJargonCount.textContent = `${clause.jargonTerms.length} terms`;

    modalJargonTags.innerHTML = '';
    if (clause.jargonTerms.length > 0) {
      clause.jargonTerms.forEach(t => {
        const tag = document.createElement('span');
        tag.className = 'jargon-tag';
        tag.textContent = t;
        modalJargonTags.appendChild(tag);
      });
      document.getElementById('modal-jargon-tags-wrapper').classList.remove('hidden');
    } else {
      document.getElementById('modal-jargon-tags-wrapper').classList.add('hidden');
    }

    btnModalRewriteSingle.disabled = clause.isRewritten;
    if (clause.isRewritten) {
      btnModalRewriteSingle.innerHTML = `<i data-lucide="check"></i> Already Simplified`;
    } else {
      btnModalRewriteSingle.innerHTML = `<i data-lucide="wand-2"></i> Rewrite This Clause Only`;
    }

    clauseModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  function closeModal() {
    clauseModal.classList.add('hidden');
    activeModalClauseId = null;
  }

  function resetAll() {
    rawText = '';
    clauses = [];
    textInput.value = '';
    sampleSelector.value = '';
    removeUploadedFile();
    updateWordCountDisplay();
    resetGauge();

    highlightedContent.innerHTML = '';
    diffOriginalList.innerHTML = '';
    diffRewrittenList.innerHTML = '';
    emptyState.classList.remove('hidden');
    highlightedContent.classList.add('hidden');
    diffContent.classList.add('hidden');
    rewrittenStatusTag.classList.add('hidden');

    btnRewrite.disabled = true;
    btnCopyRewritten.disabled = true;
    btnDownloadTxt.disabled = true;

    showToast('Reset application data');
  }

  function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3200);
  }
});
