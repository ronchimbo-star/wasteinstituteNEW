/* ============================================
   WasteInstitute LMS — App Logic
   ============================================ */

/* eslint-disable no-unused-vars */

// ---- State (in-memory only) ----
const state = {
  currentView: "landing",
  currentModule: null,
  currentLesson: null,
  completedLessons: new Set(),
  quizScores: {},
  quizPassed: new Set(),
  finalPassed: false,
  finalScore: null,
  sidebarOpen: false,
  expandedModules: new Set(),
  courseData: null,
  assessmentAnswers: {},
  assessmentCurrentQ: 0,
  assessmentQuestions: [],
  assessmentTimerInterval: null,
  assessmentTimeLeft: 3600
};

// ---- Module Icons & Emoji ----
const MODULE_ICONS = ["⚖️", "🏥", "♻️", "📋", "🔍"];
const MODULE_EMOJIS = ["⚖️", "📘", "♻️", "📋", "🔍"];

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", () => {
  fetchCourseData();
});

function fetchCourseData() {
  fetch("./course-content.json")
    .then(r => r.json())
    .then(data => {
      state.courseData = data;
      renderSidebar();
      renderView();
      initScrollToTop();
      initSidebarToggle();
    })
    .catch(() => {
      document.getElementById("app").innerHTML = "<p style='padding:48px;color:red;'>Failed to load course data.</p>";
    });
}

// ---- Sidebar Rendering ----
function renderSidebar() {
  const d = state.courseData;
  const sb = document.getElementById("sidebar-nav");
  let html = "";
  d.modules.forEach((mod, mi) => {
    const isExpanded = state.expandedModules.has(mi);
    const allLessonsComplete = mod.lessons.every((_, li) => state.completedLessons.has(`${mi}-${li}`));
    const quizDone = state.quizPassed.has(mi);
    const isActive = state.currentModule === mi;
    html += `<div class="sidebar-nav-item">
      <div class="sidebar-module-header ${isActive ? "active" : ""} ${allLessonsComplete && quizDone ? "completed" : ""}"
           onclick="toggleModule(${mi})">
        <span class="sidebar-module-number">${allLessonsComplete && quizDone ? "✓" : mi + 1}</span>
        <span class="sidebar-module-title">${mod.title}</span>
        <svg class="sidebar-module-chevron ${isExpanded ? "expanded" : ""}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4l4 4-4 4"/></svg>
      </div>
      <div class="sidebar-lessons ${isExpanded ? "expanded" : ""}">`;
    mod.lessons.forEach((les, li) => {
      const isCompleted = state.completedLessons.has(`${mi}-${li}`);
      const isLessonActive = state.currentView === "lesson" && state.currentModule === mi && state.currentLesson === li;
      html += `<div class="sidebar-lesson ${isLessonActive ? "active" : ""} ${isCompleted ? "completed" : ""}"
                    onclick="navigateTo('lesson', ${mi}, ${li})">
        <svg class="sidebar-lesson-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
          ${isCompleted ? '<path d="M3 8l3.5 3.5L13 5"/>' : '<circle cx="8" cy="8" r="3"/>'}
        </svg>
        <span>${les.title}</span>
      </div>`;
    });
    const quizActive = state.currentView === "quiz" && state.currentModule === mi;
    html += `<div class="sidebar-quiz-link ${quizActive ? "active" : ""} ${quizDone ? "completed" : ""}"
                  onclick="navigateTo('quiz', ${mi})">
      <svg class="sidebar-lesson-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        ${quizDone ? '<path d="M3 8l3.5 3.5L13 5"/>' : '<rect x="3" y="3" width="10" height="10" rx="2"/>'}
      </svg>
      <span>Module Quiz</span>
    </div>`;
    html += `</div></div>`;
  });
  sb.innerHTML = html;

  // Final assessment link
  document.getElementById("sidebar-final").onclick = () => navigateTo("assessment");

  // Update progress
  updateProgress();
}

function toggleModule(mi) {
  if (state.expandedModules.has(mi)) {
    state.expandedModules.delete(mi);
  } else {
    state.expandedModules.add(mi);
  }
  // Also navigate to module intro
  navigateTo("module", mi);
}

function updateProgress() {
  const d = state.courseData;
  const totalItems = d.modules.reduce((a, m) => a + m.lessons.length, 0) + d.modules.length; // lessons + quizzes
  let completed = state.completedLessons.size + state.quizPassed.size;
  const pct = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;

  const fill = document.getElementById("progress-fill");
  const label = document.getElementById("progress-pct");
  const headerPill = document.getElementById("header-progress-text");
  const ring = document.getElementById("header-progress-circle");
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = pct + "%";
  if (headerPill) headerPill.textContent = pct + "% Complete";
  if (ring) {
    const circumference = 2 * Math.PI * 8; // r=8
    const offset = circumference - (pct / 100) * circumference;
    ring.setAttribute("stroke-dashoffset", offset);
  }
}

// ---- Navigation ----
function navigateTo(view, modIdx, lesIdx) {
  // Clear assessment timer if leaving
  if (state.assessmentTimerInterval && view !== "assessment") {
    clearInterval(state.assessmentTimerInterval);
    state.assessmentTimerInterval = null;
  }

  state.currentView = view;
  if (modIdx !== undefined) {
    state.currentModule = modIdx;
    state.expandedModules.add(modIdx);
  }
  if (lesIdx !== undefined) state.currentLesson = lesIdx;

  renderView();
  renderSidebar();

  // Close mobile sidebar
  if (state.sidebarOpen) closeSidebar();

  // Scroll to top
  const contentArea = document.querySelector(".content-area");
  if (contentArea) contentArea.scrollIntoView({ behavior: "smooth", block: "start" });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderView() {
  const area = document.getElementById("content-area");
  area.style.opacity = "0";
  setTimeout(() => {
    switch (state.currentView) {
    case "landing":
      renderLanding(area);
      break;
    case "module":
      renderModuleIntro(area);
      break;
    case "lesson":
      renderLesson(area);
      break;
    case "quiz":
      renderQuiz(area);
      break;
    case "assessment":
      renderAssessment(area);
      break;
    case "certificate":
      renderCertificate(area);
      break;
    default:
      renderLanding(area);
    }
    area.style.opacity = "1";
    updateBreadcrumb();
  }, 150);
}

// ---- Breadcrumb ----
function updateBreadcrumb() {
  const bc = document.getElementById("breadcrumb");
  const d = state.courseData;
  let items = [{label: "Course Home", action: "navigateTo('landing')"}];

  if (state.currentView === "module" && state.currentModule !== null) {
    items.push({label: `Module ${state.currentModule + 1}`, action: null});
  } else if (state.currentView === "lesson" && state.currentModule !== null) {
    items.push({label: `Module ${state.currentModule + 1}`, action: `navigateTo('module', ${state.currentModule})`});
    items.push({label: d.modules[state.currentModule].lessons[state.currentLesson].title, action: null});
  } else if (state.currentView === "quiz" && state.currentModule !== null) {
    items.push({label: `Module ${state.currentModule + 1}`, action: `navigateTo('module', ${state.currentModule})`});
    items.push({label: "Module Quiz", action: null});
  } else if (state.currentView === "assessment") {
    items.push({label: "Final Assessment", action: null});
  } else if (state.currentView === "certificate") {
    items.push({label: "Certificate", action: null});
  }

  bc.innerHTML = items.map((item, i) => {
    if (i === items.length - 1) {
      return `<span class="breadcrumb-current">${item.label}</span>`;
    }
    return `<span class="breadcrumb-item" onclick="${item.action}">${item.label}</span><span class="breadcrumb-sep">/</span>`;
  }).join("");
}

// ---- Landing Page ----
function renderLanding(area) {
  const d = state.courseData;
  area.innerHTML = `
    <div class="landing-hero">
      <div class="landing-hero-content">
        <div class="landing-badge">🎓 Professional Certificate Course</div>
        <h1 class="landing-title">${d.courseTitle}</h1>
        <p class="landing-subtitle">Master UK healthcare waste legislation, HTM 07-01 compliance, internal auditing, and inspection preparation. A comprehensive programme developed by waste management professionals, for waste management professionals.</p>
        <div class="landing-stats">
          <div class="landing-stat"><span class="landing-stat-icon">📚</span> 5 Modules</div>
          <div class="landing-stat"><span class="landing-stat-icon">⏱️</span> 40-50 Hours</div>
          <div class="landing-stat"><span class="landing-stat-icon">📝</span> 25 Lessons</div>
          <div class="landing-stat"><span class="landing-stat-icon">🏆</span> Certificate</div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button class="btn-primary" onclick="navigateTo('module', 0)">Start Course →</button>
          <button class="btn-outline-white" onclick="document.getElementById('modules-section').scrollIntoView({behavior:'smooth'})">View Curriculum</button>
        </div>
      </div>
      <div class="course-badge-container">
        ${renderCourseBadge()}
      </div>
    </div>

    <!-- What You'll Learn -->
    <div class="landing-section">
      <div class="section-label">What You'll Learn</div>
      <h2 class="section-title">Comprehensive Healthcare Waste Management Expertise</h2>
      <p class="section-desc">This course equips you with the knowledge and practical skills to manage healthcare waste safely, legally, and sustainably.</p>
      <div class="learn-grid">
        ${[
    "Understand UK waste legislation including EPA 1990, Hazardous Waste Regulations, and EPR 2016",
    "Apply the HTM 07-01 colour-coded waste segregation system with confidence",
    "Interpret the NHS Clinical Waste Strategy 20:20:60 targets and drive compliance",
    "Classify healthcare waste using EWC codes and hazardous property assessments",
    "Plan, conduct, and report on internal healthcare waste audits",
    "Design waste minimisation plans aligned with the circular economy",
    "Prepare for and manage inspections from EA, CQC, and HSE",
    "Build a culture of continuous compliance in your organisation"
  ].map(t => `<div class="learn-item">
          <div class="learn-item-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#DCFCE7"/><path d="M6 10l2.5 2.5L14 7.5" stroke="#00B300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="learn-item-text">${t}</div>
        </div>`).join("")}
      </div>
    </div>

    <!-- Modules -->
    <div class="landing-section-alt" id="modules-section">
      <div class="landing-section-inner">
        <div class="section-label">Course Curriculum</div>
        <h2 class="section-title">5 Comprehensive Modules</h2>
        <p class="section-desc">Each module builds on the previous, taking you from legal foundations through to inspection readiness.</p>
        <div class="module-cards">
          ${d.modules.map((mod, mi) => `
            <div class="module-card" onclick="navigateTo('module', ${mi})">
              <div class="module-card-number">${mi + 1}</div>
              <div class="module-card-icon">${MODULE_ICONS[mi]}</div>
              <h3 class="module-card-title">${mod.title}</h3>
              <p class="module-card-desc">${mod.description.substring(0, 120)}...</p>
              <div class="module-card-meta">
                <span>📖 ${mod.lessons.length} Lessons</span>
                <span>⏱️ ${mod.duration}</span>
                <span>📝 Quiz</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Who This Is For -->
    <div class="landing-section">
      <div class="section-label">Who This Course Is For</div>
      <h2 class="section-title">Designed for Waste Management Professionals</h2>
      <p class="section-desc">Whether you're new to healthcare waste or an experienced professional seeking formal knowledge, this course is for you.</p>
      <div class="audience-grid">
        ${[
    {icon: "🏥", text: "Healthcare Waste Managers & Officers"},
    {icon: "♻️", text: "Environmental & Sustainability Managers"},
    {icon: "📋", text: "Compliance & Risk Officers"},
    {icon: "🧑‍⚕️", text: "Infection Prevention & Control Teams"},
    {icon: "🏛️", text: "NHS Trust Board Members"},
    {icon: "🔧", text: "Facilities & Estates Managers"},
    {icon: "📦", text: "Waste Contractors & Service Providers"},
    {icon: "🎓", text: "Environmental Health Students"}
  ].map(a => `<div class="audience-item"><span class="audience-icon">${a.icon}</span>${a.text}</div>`).join("")}
      </div>
    </div>

    <!-- Instructor -->
    <div class="landing-section-alt">
      <div class="landing-section-inner">
        <div class="section-label">Your Instructor</div>
        <h2 class="section-title">Expert-Led Content</h2>
        <div class="instructor-card">
          <img src="./assets/profile.png" alt="Ron Chimbo" class="instructor-avatar" style="width:80px;height:80px;border-radius:50%;object-fit:cover;background:#f5f5f5;">
          <div class="instructor-info">
            <h3>Ron Chimbo</h3>
            <p>A seasoned waste management professional with over 20 years of experience across multiple sectors in waste management, regulatory compliance, sustainability strategy, and circular economy. Ron has consulted extensively within the NHS, Banking, Logistics, and Transportation sectors, bringing practical insights from diverse industry applications. He has worked on various innovative start-ups including MediWaste, ToolServe, and SaniLady, and has been instrumental in the development of the Waste Institute. His comprehensive expertise ensures this course delivers real-world knowledge grounded in regulatory excellence and operational best practices.</p>
          </div>
        </div>
      </div>
    </div>

    ${renderFooter()}
  `;
}

function renderCourseBadge() {
  return `<svg class="course-badge" viewBox="0 0 180 210" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Shield shape -->
    <path d="M90 8 L170 40 L170 120 Q170 175 90 202 Q10 175 10 120 L10 40 Z" fill="#0A1628" stroke="#00B300" stroke-width="2"/>
    <path d="M90 20 L158 48 L158 116 Q158 165 90 190 Q22 165 22 116 L22 48 Z" fill="none" stroke="rgba(0,179,0,0.2)" stroke-width="1"/>
    <!-- Medical cross -->
    <rect x="75" y="60" width="30" height="70" rx="4" fill="#00B300" opacity="0.9"/>
    <rect x="57" y="78" width="66" height="30" rx="4" fill="#00B300" opacity="0.9"/>
    <!-- Recycling arrows circle -->
    <circle cx="90" cy="155" r="18" fill="none" stroke="#00D400" stroke-width="2" opacity="0.6"/>
    <path d="M82 148 l8-6 l0 12z" fill="#00D400" opacity="0.6"/>
    <path d="M98 162 l-8 6 l0-12z" fill="#00D400" opacity="0.6"/>
    <!-- Star -->
    <polygon points="90,32 93,40 101,40 95,45 97,53 90,49 83,53 85,45 79,40 87,40" fill="#FFD700"/>
  </svg>`;
}

// ---- Module Intro Page ----
function renderModuleIntro(area) {
  const d = state.courseData;
  const mod = d.modules[state.currentModule];
  area.innerHTML = `
    <div class="module-intro-banner">
      <div class="module-intro-number">Module ${state.currentModule + 1} of ${d.modules.length}</div>
      <h1 class="module-intro-title">${mod.title}</h1>
      <p class="module-intro-desc">${mod.description}</p>
      <div class="module-intro-meta">
        <span>⏱️ ${mod.duration}</span>
        <span>📖 ${mod.lessons.length} Lessons</span>
        <span>📝 10-Question Quiz</span>
      </div>
      <div class="module-intro-icon">${MODULE_ICONS[state.currentModule]}</div>
    </div>
    <div class="module-intro-body">
      <h2 style="font-family:var(--font-heading);font-size:20px;font-weight:700;margin-bottom:20px;">Learning Objectives</h2>
      <ul class="objectives-list">
        ${mod.objectives.map(obj => `<li><span class="obj-check"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l2.5 2.5L11 4.5" stroke="#00B300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>${obj}</span></li>`).join("")}
      </ul>
      <h2 style="font-family:var(--font-heading);font-size:20px;font-weight:700;margin-bottom:20px;">Lessons in This Module</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:40px;">
        ${mod.lessons.map((les, li) => {
    const isComplete = state.completedLessons.has(`${state.currentModule}-${li}`);
    const readMin = estimateReadTime(les);
    return `<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;background:${isComplete ? "var(--light-green)" : "var(--surface)"};border-radius:var(--radius-md);cursor:pointer;border:1px solid ${isComplete ? "var(--green-border)" : "var(--border-light)"};" onclick="navigateTo('lesson', ${state.currentModule}, ${li})">
            <span style="color:${isComplete ? "var(--green)" : "var(--muted)"};font-size:14px;font-weight:600;min-width:24px;">${li + 1}.</span>
            <span style="flex:1;font-size:14px;font-weight:500;">${les.title}</span>
            ${isComplete ? '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#00B300"/><path d="M5 9l2.5 2.5L13 6.5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>' : `<span style="font-size:12px;color:var(--muted);">~${readMin} min</span>`}
          </div>`;
  }).join("")}
      </div>
      <button class="btn-primary" onclick="navigateTo('lesson', ${state.currentModule}, 0)">Begin Module →</button>
    </div>
    ${renderFooter()}
  `;
}

function estimateReadTime(contentOrLesson) {
  // If it's a lesson object with readTime field, use that
  if (typeof contentOrLesson === 'object' && contentOrLesson.readTime) {
    // Extract just the first number from strings like "18-22 min"
    const match = contentOrLesson.readTime.match(/\d+/);
    return match ? parseInt(match[0], 10) : 10;
  }
  // Otherwise estimate from text/HTML content length
  const text = typeof contentOrLesson === 'string' ? contentOrLesson : '';
  const stripped = text.replace(/<[^>]+>/g, ' ');
  return Math.max(5, Math.round(stripped.split(/\s+/).length / 200));
}

// ---- Module color shades for creative accents ----
const MODULE_COLORS = ['#00B300', '#00A300', '#009900', '#008F00', '#007A00'];

// ---- Lesson Page ----
function renderLesson(area) {
  const d = state.courseData;
  const mod = d.modules[state.currentModule];
  const les = mod.lessons[state.currentLesson];
  const isComplete = state.completedLessons.has(`${state.currentModule}-${state.currentLesson}`);
  const readTime = estimateReadTime(les);
  const mi = state.currentModule;
  const li = state.currentLesson;
  const moduleColor = MODULE_COLORS[mi] || '#00B300';

  // Build special chart content for specific lessons
  let specialContent = '';
  if (mi === 1 && li === 2) specialContent += renderWasteColourChart();
  if (mi === 0 && li === 1) specialContent += renderDutyOfCareFlowchart();
  if (mi === 2 && li === 0) specialContent += renderWasteHierarchy();
  if (mi === 3 && li === 0) specialContent += renderAuditFlowchart();
  if (mi === 4 && li === 3) specialContent += renderInspectionFlowchart();

  area.innerHTML = `
    <div class="lesson-header">
      <div class="lesson-header-logo">
        <img src="./assets/logo.jpg" alt="WasteInstitute" class="lesson-logo-img">
      </div>
      <h1 class="lesson-title">${les.title}</h1>
      <div class="lesson-meta">
        <span>📖 Lesson ${li + 1} of ${mod.lessons.length}</span>
        <span>⏱️ ~${readTime} min read</span>
        <span>${MODULE_ICONS[mi]} Module ${mi + 1}</span>
      </div>
    </div>
    <div class="lesson-body rich-content" data-module="${mi}" style="--module-accent:${moduleColor};">
      <div class="lesson-watermark" aria-hidden="true">${getWIWatermarkSVG(moduleColor)}</div>
      ${les.content}
      ${specialContent}
    </div>
    <div class="lesson-nav">
      ${li > 0
    ? `<button class="lesson-nav-btn" onclick="navigateTo('lesson', ${mi}, ${li - 1})">← Previous Lesson</button>`
    : `<button class="lesson-nav-btn" onclick="navigateTo('module', ${mi})" style="opacity:0.5;">← Module Intro</button>`
}
      <button class="mark-complete-btn ${isComplete ? "completed" : ""}" onclick="toggleLessonComplete(${mi}, ${li})">
        ${isComplete ? "✓ Completed" : "Mark as Complete"}
      </button>
      ${li < mod.lessons.length - 1
    ? `<button class="lesson-nav-btn" onclick="navigateTo('lesson', ${mi}, ${li + 1})">Next Lesson →</button>`
    : `<button class="lesson-nav-btn" onclick="navigateTo('quiz', ${mi})" style="background:var(--green);color:white;border-color:var(--green);">Take Module Quiz →</button>`
}
    </div>
    ${renderFooter()}
  `;
}

// ---- WI Watermark SVG ----
function getWIWatermarkSVG(color) {
  return `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="wi-watermark-svg">
    <circle cx="60" cy="35" r="16" fill="${color}" opacity="0.04"/>
    <path d="M60 55c-22 0-40 10-40 22v8h80v-8c0-12-18-22-40-22z" fill="${color}" opacity="0.04"/>
    <circle cx="30" cy="45" r="10" fill="${color}" opacity="0.03"/>
    <path d="M30 58c-14 0-25 7-25 15v5h50v-5c0-8-11-15-25-15z" fill="${color}" opacity="0.03"/>
    <circle cx="90" cy="45" r="10" fill="${color}" opacity="0.03"/>
    <path d="M90 58c-14 0-25 7-25 15v5h50v-5c0-8-11-15-25-15z" fill="${color}" opacity="0.03"/>
  </svg>`;
}

function toggleLessonComplete(mi, li) {
  const key = `${mi}-${li}`;
  if (state.completedLessons.has(key)) {
    state.completedLessons.delete(key);
  } else {
    state.completedLessons.add(key);
  }
  renderView();
  renderSidebar();
}

// Legacy formatLessonContent removed — rich HTML now injected directly from course-content.json

// ---- Waste Colour Coding Chart (Module 2 Lesson 3) ----
function renderWasteColourChart() {
  const items = [
    {
      cls: "yellow-bag", icon: "⚠️", label: "Yellow Bag / Yellow Lid",
      type: "Infectious Waste — Incineration Required",
      examples: "Anatomical waste, certain pharmaceutical waste, items contaminated with chemicals, heavily blood-soaked dressings",
      detail: "Sent to high-temperature incineration (HTI). Must be incinerated — cannot go to alternative treatment."
    },
    {
      cls: "orange-bag", icon: "🧪", label: "Orange Bag / Orange Lid",
      type: "Infectious Waste — Alternative Treatment",
      examples: "Non-anatomical infectious waste, lightly contaminated PPE, lab cultures, specimen containers",
      detail: "Can be treated by autoclaving, microwave, or chemical treatment before disposal. Less costly than incineration."
    },
    {
      cls: "purple-lid", icon: "💊", label: "Purple Lid",
      type: "Cytotoxic & Cytostatic Medicinal Waste",
      examples: "Chemotherapy drugs, contaminated items from cytotoxic drug preparation, vials, IV tubing used with cytotoxic agents",
      detail: "Requires high-temperature incineration. Must be segregated from other pharmaceutical waste due to mutagenic/teratogenic properties."
    },
    {
      cls: "tiger-bag", icon: "🐯", label: "Tiger Bag (Yellow + Black Stripes)",
      type: "Offensive / Hygiene Waste (Non-Infectious)",
      examples: "Nappies, incontinence pads, sanitary waste, non-infectious PPE, plaster casts, empty catheter bags",
      detail: "The 20:20:60 target aims for 60% of clinical waste to be correctly classified as offensive. Significantly cheaper to manage — can go to energy-from-waste."
    },
    {
      cls: "black-bag", icon: "🗑️", label: "Black Bag",
      type: "Domestic / Municipal Type Waste",
      examples: "Office paper, food waste, general packaging, newspapers, non-contaminated domestic items",
      detail: "Standard domestic waste stream — recycling or energy recovery. Should never contain any clinical or contaminated items."
    },
    {
      cls: "blue-lid", icon: "💉", label: "Blue Lid",
      type: "Pharmaceutical Waste — Incineration",
      examples: "Non-cytotoxic medicines, out-of-date pharmaceuticals, controlled drugs (after denaturing), partly used vials",
      detail: "Pharmaceutical waste requiring incineration. Does NOT include cytotoxic medicines (those go in purple)."
    }
  ];

  return `
    <h3 style="font-family:var(--font-heading);font-size:20px;font-weight:700;margin:32px 0 16px;">Interactive Waste Colour-Coding Chart</h3>
    <p style="font-size:14px;color:var(--muted);margin-bottom:16px;">Click each category to expand details and examples.</p>
    <div class="waste-chart">
      ${items.map((item, i) => `
        <div class="waste-chart-item" onclick="this.classList.toggle('expanded')" id="waste-item-${i}">
          <div class="waste-chart-header ${item.cls}">
            <span class="waste-chart-icon">${item.icon}</span>
            <div>
              <div class="waste-chart-label">${item.label}</div>
              <div style="font-size:12px;opacity:0.85;margin-top:2px;">${item.type}</div>
            </div>
          </div>
          <div class="waste-chart-body">
            <strong>Examples:</strong>
            ${item.examples}
            <br><br>
            <strong>Disposal Route:</strong>
            ${item.detail}
          </div>
        </div>
      `).join("")}
    </div>`;
}

// ---- Flowcharts ----
function renderDutyOfCareFlowchart() {
  const steps = [
    {label: "Waste Producer (Healthcare Setting)", highlight: true},
    {label: "Prevent waste from escaping control"},
    {label: "Complete written waste description"},
    {label: "Transfer only to authorised persons"},
    {label: "Complete waste transfer/consignment note"},
    {label: "Authorised Waste Carrier", highlight: true},
    {label: "Licensed Waste Treatment/Disposal Facility", highlight: true}
  ];
  return `
    <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:700;margin:32px 0 12px;">Duty of Care Chain</h3>
    <div class="flowchart">
      ${steps.map((s, i) => `
        <div class="flowchart-step ${s.highlight ? "highlight" : ""}">${s.label}</div>
        ${i < steps.length - 1 ? '<div class="flowchart-arrow"></div>' : ""}
      `).join("")}
    </div>`;
}

function renderWasteHierarchy() {
  const steps = [
    {label: "🔺 Prevention — Most Preferred", highlight: true},
    {label: "♻️ Prepare for Reuse"},
    {label: "🔄 Recycle"},
    {label: "⚡ Other Recovery (Energy)"},
    {label: "🗑️ Disposal — Least Preferred", highlight: false}
  ];
  return `
    <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:700;margin:32px 0 12px;">The Waste Hierarchy</h3>
    <div class="flowchart">
      ${steps.map((s, i) => `
        <div class="flowchart-step ${i === 0 ? "highlight" : ""}" style="${i === 0 ? "background:var(--green);color:white;border-color:var(--green);" : ""}">${s.label}</div>
        ${i < steps.length - 1 ? '<div class="flowchart-arrow"></div>' : ""}
      `).join("")}
    </div>`;
}

function renderAuditFlowchart() {
  const steps = [
    {label: "1. Define Audit Scope & Objectives", highlight: true},
    {label: "2. Assemble Audit Team"},
    {label: "3. Develop Audit Checklist"},
    {label: "4. Conduct On-Site Audit"},
    {label: "5. Record Findings & Evidence"},
    {label: "6. Analyse & Report", highlight: true},
    {label: "7. Corrective Action Plan"}
  ];
  return `
    <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:700;margin:32px 0 12px;">The Audit Process</h3>
    <div class="flowchart">
      ${steps.map((s, i) => `
        <div class="flowchart-step ${s.highlight ? "highlight" : ""}">${s.label}</div>
        ${i < steps.length - 1 ? '<div class="flowchart-arrow"></div>' : ""}
      `).join("")}
    </div>`;
}

function renderInspectionFlowchart() {
  const steps = [
    {label: "Before: Prepare Evidence Portfolio", highlight: true},
    {label: "Before: Brief Staff & Check Areas"},
    {label: "During: Accompany Inspector"},
    {label: "During: Answer Honestly & Take Notes"},
    {label: "After: Review Report & Findings"},
    {label: "After: Create Action Plan", highlight: true},
    {label: "After: Implement & Verify Corrections"}
  ];
  return `
    <h3 style="font-family:var(--font-heading);font-size:18px;font-weight:700;margin:32px 0 12px;">Managing the Inspection Process</h3>
    <div class="flowchart">
      ${steps.map((s, i) => `
        <div class="flowchart-step ${s.highlight ? "highlight" : ""}">${s.label}</div>
        ${i < steps.length - 1 ? '<div class="flowchart-arrow"></div>' : ""}
      `).join("")}
    </div>`;
}

// ---- Quiz Page ----
function renderQuiz(area) {
  const d = state.courseData;
  const mod = d.modules[state.currentModule];
  const quiz = mod.quiz;
  const quizKey = `mod${state.currentModule}`;

  // Check if already submitted
  const existingScore = state.quizScores[quizKey];
  const alreadyPassed = state.quizPassed.has(state.currentModule);

  area.innerHTML = `
    <div class="quiz-header">
      <h1 class="quiz-title">${MODULE_ICONS[state.currentModule]} Module ${state.currentModule + 1} Quiz</h1>
      <p class="quiz-subtitle">${mod.title} — 10 Multiple Choice Questions • 75% Pass Mark</p>
    </div>
    <div class="quiz-body" id="quiz-body">
      ${quiz.map((q, qi) => `
        <div class="quiz-question" id="quiz-q-${qi}">
          <div class="quiz-question-number">Question ${qi + 1} of ${quiz.length}</div>
          <div class="quiz-question-text">${q.q}</div>
          <div class="quiz-options" id="quiz-opts-${qi}">
            ${q.options.map((opt, oi) => `
              <div class="quiz-option" id="quiz-opt-${qi}-${oi}" onclick="selectQuizOption(${qi}, ${oi})">
                <span class="quiz-option-letter">${String.fromCharCode(65 + oi)}</span>
                <span>${opt}</span>
              </div>
            `).join("")}
          </div>
          <div class="quiz-explanation" id="quiz-exp-${qi}">${q.explanation}</div>
        </div>
      `).join("")}
      <div class="quiz-submit-section">
        <button class="btn-primary" id="quiz-submit-btn" onclick="submitQuiz(${state.currentModule})">Submit Quiz</button>
      </div>
      <div id="quiz-results"></div>
    </div>
    ${renderFooter()}
  `;
}

// In-memory quiz selections
const quizSelections = {};

function selectQuizOption(qi, oi) {
  const key = `${state.currentModule}-${qi}`;
  quizSelections[key] = oi;

  // Visual feedback
  const opts = document.querySelectorAll(`#quiz-opts-${qi} .quiz-option`);
  opts.forEach((opt, i) => {
    opt.classList.remove("selected");
    if (i === oi) opt.classList.add("selected");
  });
}

function submitQuiz(mi) {
  const d = state.courseData;
  const quiz = d.modules[mi].quiz;
  let correct = 0;

  quiz.forEach((q, qi) => {
    const key = `${mi}-${qi}`;
    const selected = quizSelections[key];
    const opts = document.querySelectorAll(`#quiz-opts-${qi} .quiz-option`);

    opts.forEach((opt, oi) => {
      opt.style.pointerEvents = "none";
      if (oi === q.correct) {
        opt.classList.add("correct-answer");
      }
      if (selected === oi) {
        if (oi === q.correct) {
          opt.classList.add("correct");
          correct++;
        } else {
          opt.classList.add("incorrect");
        }
      }
    });

    // Show explanation
    document.getElementById(`quiz-exp-${qi}`).classList.add("visible");
  });

  const score = Math.round((correct / quiz.length) * 100);
  const passed = score >= 75;
  state.quizScores[`mod${mi}`] = score;

  if (passed) {
    state.quizPassed.add(mi);
    triggerConfetti();
  }

  // Hide submit button
  document.getElementById("quiz-submit-btn").style.display = "none";

  // Show results
  document.getElementById("quiz-results").innerHTML = `
    <div class="quiz-results">
      <div class="quiz-results-score ${passed ? "" : "failed"}">${correct}/${quiz.length}</div>
      <div class="quiz-results-label">You scored ${score}%</div>
      <div class="quiz-results-status ${passed ? "pass" : "fail"}">
        ${passed ? "🎉 Passed!" : "❌ Not Passed"}
      </div>
      <br>
      ${passed
    ? `<button class="btn-primary" onclick="${mi < d.modules.length - 1 ? `navigateTo('module', ${mi + 1})` : `navigateTo('assessment')`}">
            ${mi < d.modules.length - 1 ? "Continue to Module " + (mi + 2) + " →" : "Take Final Assessment →"}
          </button>`
    : `<button class="btn-secondary" onclick="retryQuiz(${mi})">Retry Quiz</button>`
}
    </div>
  `;

  renderSidebar();
}

function retryQuiz(mi) {
  // Clear selections for this module
  const d = state.courseData;
  d.modules[mi].quiz.forEach((_, qi) => {
    delete quizSelections[`${mi}-${qi}`];
  });
  renderView();
}

// ---- Final Assessment ----
function renderAssessment(area) {
  if (state.finalPassed) {
    renderAssessmentResults(area);
    return;
  }

  // Generate 25 questions (5 from each module)
  if (state.assessmentQuestions.length === 0) {
    const d = state.courseData;
    state.assessmentQuestions = [];
    state.assessmentAnswers = {};
    state.assessmentCurrentQ = 0;
    state.assessmentTimeLeft = 3600;

    d.modules.forEach((mod) => {
      const shuffled = [...mod.quiz].sort(() => Math.random() - 0.5).slice(0, 5);
      state.assessmentQuestions.push(...shuffled);
    });
  }

  const q = state.assessmentQuestions[state.assessmentCurrentQ];
  const totalQ = state.assessmentQuestions.length;

  area.innerHTML = `
    <div class="quiz-header">
      <h1 class="quiz-title">📋 Final Course Assessment</h1>
      <p class="quiz-subtitle">25 Questions • 60 Minutes • 75% Pass Mark • No going back</p>
    </div>
    <div class="assessment-timer" id="assessment-timer">
      ⏱️ Time Remaining: <span id="timer-display">${formatTime(state.assessmentTimeLeft)}</span>
    </div>
    <div class="assessment-question-indicator">
      Question ${state.assessmentCurrentQ + 1} of ${totalQ}
      <div class="assessment-dots">
        ${state.assessmentQuestions.map((_, i) => `<div class="assessment-dot ${i === state.assessmentCurrentQ ? "current" : i < state.assessmentCurrentQ ? "answered" : ""}"></div>`).join("")}
      </div>
    </div>
    <div class="quiz-body">
      <div class="quiz-question">
        <div class="quiz-question-number">Question ${state.assessmentCurrentQ + 1}</div>
        <div class="quiz-question-text">${q.q}</div>
        <div class="quiz-options">
          ${q.options.map((opt, oi) => `
            <div class="quiz-option ${state.assessmentAnswers[state.assessmentCurrentQ] === oi ? "selected" : ""}"
                 onclick="selectAssessmentOption(${oi})">
              <span class="quiz-option-letter">${String.fromCharCode(65 + oi)}</span>
              <span>${opt}</span>
            </div>
          `).join("")}
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;padding:0 0 40px;">
        ${state.assessmentCurrentQ < totalQ - 1
    ? `<button class="btn-primary" onclick="nextAssessmentQuestion()">Next Question →</button>`
    : `<button class="btn-primary" onclick="submitAssessment()" style="background:var(--navy);">Submit Assessment</button>`
}
      </div>
    </div>
  `;

  // Start timer
  if (!state.assessmentTimerInterval) {
    state.assessmentTimerInterval = setInterval(() => {
      state.assessmentTimeLeft--;
      const display = document.getElementById("timer-display");
      const timerEl = document.getElementById("assessment-timer");
      if (display) display.textContent = formatTime(state.assessmentTimeLeft);
      if (timerEl && state.assessmentTimeLeft < 300) timerEl.classList.add("warning");
      if (state.assessmentTimeLeft <= 0) {
        clearInterval(state.assessmentTimerInterval);
        state.assessmentTimerInterval = null;
        submitAssessment();
      }
    }, 1000);
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function selectAssessmentOption(oi) {
  state.assessmentAnswers[state.assessmentCurrentQ] = oi;
  const opts = document.querySelectorAll(".quiz-option");
  opts.forEach((opt, i) => {
    opt.classList.remove("selected");
    if (i === oi) opt.classList.add("selected");
  });
}

function nextAssessmentQuestion() {
  state.assessmentCurrentQ++;
  renderView();
}

function submitAssessment() {
  if (state.assessmentTimerInterval) {
    clearInterval(state.assessmentTimerInterval);
    state.assessmentTimerInterval = null;
  }

  let correct = 0;
  state.assessmentQuestions.forEach((q, i) => {
    if (state.assessmentAnswers[i] === q.correct) correct++;
  });

  const score = Math.round((correct / state.assessmentQuestions.length) * 100);
  state.finalScore = score;
  state.finalPassed = score >= 75;

  if (state.finalPassed) triggerConfetti();

  renderAssessmentResults(document.getElementById("content-area"));
  renderSidebar();
}

function renderAssessmentResults(area) {
  const passed = state.finalPassed;
  const correct = Math.round(state.finalScore / 100 * 25);
  area.innerHTML = `
    <div class="quiz-header">
      <h1 class="quiz-title">📋 Final Assessment — Results</h1>
    </div>
    <div class="quiz-results" style="padding:60px 48px;">
      <div class="quiz-results-score ${passed ? "" : "failed"}">${correct}/25</div>
      <div class="quiz-results-label">You scored ${state.finalScore}%</div>
      <div class="quiz-results-status ${passed ? "pass" : "fail"}">
        ${passed ? "🎉 Congratulations! You passed!" : "❌ Not yet passed — keep studying!"}
      </div>
      <br>
      ${passed
    ? `<p style="font-size:15px;color:var(--muted);margin-bottom:24px;">You've earned your Certificate of Completion.</p>
           <button class="btn-primary" onclick="navigateTo('certificate')">View Certificate →</button>`
    : `<p style="font-size:15px;color:var(--muted);margin-bottom:24px;">You need 75% to pass. Review the modules and try again.</p>
           <button class="btn-secondary" onclick="retakeAssessment()">Retake Assessment</button>`
}
    </div>
    ${renderFooter()}
  `;
}

function retakeAssessment() {
  state.assessmentQuestions = [];
  state.assessmentAnswers = {};
  state.assessmentCurrentQ = 0;
  state.assessmentTimeLeft = 3600;
  state.finalPassed = false;
  state.finalScore = null;
  navigateTo("assessment");
}

// ---- Certificate Page ----
function renderCertificate(area) {
  const d = state.courseData;
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric"});
  const certNum = `WI-HCW-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  area.innerHTML = `
    <div class="certificate-wrapper">
      <div class="certificate-name-input">
        <label for="cert-name">Enter your name:</label>
        <input type="text" id="cert-name" placeholder="Your Full Name" oninput="updateCertName(this.value)">
      </div>
      <div class="certificate" id="certificate-print-area">
        <img src="./assets/logo.jpg" alt="WasteInstitute" class="certificate-logo">
        <div class="certificate-heading">Certificate of Completion</div>
        <div class="certificate-presented">THIS IS TO CERTIFY THAT</div>
        <div class="certificate-name" id="cert-display-name">[Your Name]</div>
        <div class="certificate-body">
          has successfully completed the<br>
          <span class="certificate-course-title">${d.courseTitle}</span>
        </div>
        <div class="certificate-date">Completed on ${dateStr}</div>
        <div class="certificate-signatures">
          <div class="certificate-sig">
            <div class="certificate-sig-line">J. Whitmore</div>
            <div class="certificate-sig-name">Dr. James Whitmore</div>
            <div class="certificate-sig-title">Director of Education</div>
          </div>
          <div class="certificate-sig">
            <div class="certificate-sig-line">S. Patel</div>
            <div class="certificate-sig-name">Sarah Patel, MCIWM</div>
            <div class="certificate-sig-title">Chief Compliance Officer</div>
          </div>
        </div>
        <div class="certificate-issuer">Issued by ${d.certificate.issuer}</div>
        <div class="certificate-number">${certNum}</div>
        <div class="certificate-note">${d.certificate.note}</div>
      </div>
      <div class="certificate-actions">
        <button class="btn-primary" onclick="window.print()">🖨️ Print Certificate</button>
        <button class="btn-secondary" onclick="navigateTo('landing')">Return to Course</button>
      </div>
    </div>
    ${renderFooter()}
  `;
}

function updateCertName(name) {
  document.getElementById("cert-display-name").textContent = name || "[Your Name]";
}

// ---- Footer ----
function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-left">
          <img src="./assets/logo-white.png" alt="WasteInstitute" class="footer-logo">
          <span class="footer-text">Copyright © 2026 WasteInstitute.org. All rights reserved.</span>
        </div>
        <div class="footer-links">
          <a href="https://wasteinstitute.org" target="_blank" rel="noopener noreferrer">wasteinstitute.org</a>
        </div>
      </div>
    </footer>
  `;
}

// ---- Scroll to Top ----
function initScrollToTop() {
  const btn = document.getElementById("scroll-top-btn");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });
  btn.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  });
}

// ---- Mobile Sidebar ----
function initSidebarToggle() {
  document.getElementById("hamburger-btn").addEventListener("click", () => {
    if (state.sidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
  document.getElementById("sidebar-overlay").addEventListener("click", closeSidebar);
}

function openSidebar() {
  state.sidebarOpen = true;
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebar-overlay").classList.add("visible");
  document.getElementById("sidebar-overlay").style.display = "block";
}

function closeSidebar() {
  state.sidebarOpen = false;
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-overlay").classList.remove("visible");
  setTimeout(() => {
    document.getElementById("sidebar-overlay").style.display = "";
  }, 300);
}

// ---- Confetti ----
function triggerConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#00B300", "#00D400", "#FFD700", "#0A1628", "#FF6B6B", "#4ECDC4", "#45B7D1"];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 4,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.rotSpeed;
      p.vy += 0.05;
      if (frame > 60) p.opacity -= 0.01;
      if (p.opacity > 0 && p.y < canvas.height + 50) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    frame++;
    if (alive && frame < 200) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}
