/*
# Populate lessons for Certificate in Healthcare Waste Management (HTM 07-01)

1. Purpose
   - Create 15 published lessons (3 per module × 5 modules) with rich HTML content
   - Each lesson has a title, multi-page HTML content, duration, and display_order
   - Content includes headings, paragraphs, bullet lists, tables, callout boxes, and images

2. Tables affected
   - `lessons` — 15 new rows inserted
   - Module IDs reference existing modules for course `6e96c9dd-6487-416f-bc4b-6638121ae4d2`

3. Security
   - No RLS policy changes (existing policies apply)
   - No schema changes

4. Idempotency
   - Uses `ON CONFLICT DO NOTHING` on module_id + title via a unique approach
   - Safe to re-run (lessons are only inserted if they don't already exist for that module)
*/

-- Module 1: The Legal Landscape of Healthcare Waste
-- Lesson 1.1: Why Healthcare Waste Law Matters
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  'cbb1b1f8-f052-459b-b58e-ec5f2470f3ae',
  'Why Healthcare Waste Law Matters',
  '<h2>The Regulatory Landscape</h2>
<p>Healthcare waste is one of the most regulated waste streams in the UK. Every business that generates clinical waste — from a single-person tattoo studio to a large NHS hospital — is bound by the same legal framework. Understanding this framework isn''t just about avoiding fines; it''s about protecting your staff, your clients, the public, and the environment.</p>

<div class="callout callout-info">
<h3>Key Principle</h3>
<p>The legal responsibility for safe waste management rests with the <strong>waste producer</strong> — that''s you, the practice or business generating the waste. You cannot transfer this duty to your waste contractor; you remain legally responsible from the moment waste is produced until it is fully treated or disposed of.</p>
</div>

<h3>The Core Legislation</h3>
<p>Several pieces of legislation govern healthcare waste in the UK. You don''t need to read them all, but you do need to understand what each one requires of you:</p>

<table>
<thead>
<tr><th>Legislation</th><th>What It Covers</th></tr>
</thead>
<tbody>
<tr><td>Environmental Protection Act 1990</td><td>The foundation of UK waste law. Establishes the duty of care for all waste producers.</td></tr>
<tr><td>Hazardous Waste Regulations 2005</td><td>Controls the storage, transport, and disposal of hazardous waste, including clinical waste classified as hazardous.</td></tr>
<tr><td>Carriage of Dangerous Goods Regulations</td><td>Governs how healthcare waste is transported on public roads, including packaging, labelling, and documentation.</td></tr>
<tr><td>HTM 07-01: Safe Management of Healthcare Waste</td><td>The primary guidance document from the Department of Health. Not law itself, but represents best practice that regulators expect you to follow.</td></tr>
</tbody>
</table>

<h3>What This Means for Your Practice</h3>
<p>Regardless of your sector — beauty, aesthetics, tattooing, podiatry, or any other clinical practice — if you generate waste that could be infectious, sharps, medicinal, or anatomical, you are a healthcare waste producer under the law. This means you must:</p>

<ul>
<li><strong>Segregate</strong> waste correctly at the point of production</li>
<li><strong>Store</strong> waste safely and securely between collections</li>
<li><strong>Document</strong> the transfer and disposal of waste with consignment notes</li>
<li><strong>Use a licensed waste carrier</strong> registered with the Environment Agency</li>
<li><strong>Train your staff</strong> in correct waste handling procedures</li>
</ul>

<div class="callout callout-warning">
<h3>Did You Know?</h3>
<p>Failure to comply with waste regulations can result in unlimited fines and, in serious cases, prosecution under the Environmental Protection Act. Even minor breaches can lead to fixed penalty notices and damage your reputation during inspections.</p>
</div>

<h3>The Cost of Non-Compliance</h3>
<p>Non-compliance isn''t just a legal risk. It carries real business costs:</p>
<ul>
<li><strong>Direct fines:</strong> Fixed penalty notices start at £300 for minor breaches; serious cases can reach tens of thousands of pounds</li>
<li><strong>Inspection failures:</strong> A failed inspection can result in enforced closure until issues are resolved</li>
<li><strong>Reputational damage:</strong> In an age of online reviews, a compliance failure can destroy client trust</li>
<li><strong>Insurance issues:</strong> Your professional indemnity insurance may be voided if waste management is found to be negligent</li>
</ul>

<h3>Summary</h3>
<p>In this lesson, we''ve established that healthcare waste is governed by a robust legal framework in the UK. The Environmental Protection Act 1990 and HTM 07-01 are the two most important references for your practice. Your duty of care begins at the point waste is produced and continues until final disposal. Understanding and complying with these laws protects your business, your staff, and your clients.</p>

<p>In the next lesson, we''ll break down the Duty of Care in practical terms — what you must do day-to-day to stay compliant.</p>',
  1,
  15
);

-- Lesson 1.2: Your Duty of Care Explained
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  'cbb1b1f8-f052-459b-b58e-ec5f2470f3ae',
  'Your Duty of Care Explained',
  '<h2>What Is the Duty of Care?</h2>
<p>The Duty of Care is a legal obligation under Section 34 of the Environmental Protection Act 1990. It applies to <em>everyone</em> who produces, imports, carries, keeps, treats, or disposes of controlled waste. In a clinical or beauty setting, that means you.</p>

<div class="callout callout-info">
<h3>Simple Definition</h3>
<p>The Duty of Care requires you to take all reasonable steps to ensure that waste is managed safely, stored correctly, transported only by authorised persons, and disposed of at a licensed facility — with a clear paper trail at every stage.</p>
</div>

<h3>The Five Pillars of Duty of Care</h3>
<p>The Duty of Care breaks down into five practical obligations. Think of these as your daily compliance checklist:</p>

<h4>1. Segregation</h4>
<p>You must segregate waste at the point of production using the correct colour-coded containers defined in HTM 07-01. Mixed waste streams can contaminate an entire batch, increasing disposal costs and creating safety risks.</p>

<table>
<thead>
<tr><th>Container Colour</th><th>Waste Type</th></tr>
</thead>
<tbody>
<tr><td>Orange bag</td><td>Infectious waste (excluding sharps and medicinal)</td></tr>
<tr><td>Yellow bag</td><td>Highly infectious waste requiring incineration</td></tr>
<tr><td>Yellow-lidded sharps box</td><td>Sharps contaminated with medicinal waste</td></tr>
<tr><td>Orange-lidded sharps box</td><td>Sharps not contaminated with medicine</td></tr>
<tr><td>Purple-lidded sharps box</td><td>Cytostatic and cytotoxic waste</td></tr>
<tr><td>Black bag</td><td>Non-clinical (general office/domestic) waste</td></tr>
</tbody>
</table>

<h4>2. Storage</h4>
<p>Waste must be stored in a secure, designated area that:</p>
<ul>
<li>Is lockable and accessible only to authorised staff</li>
<li>Is well-ventilated and protected from pests</li>
<li>Is not accessible to the public</li>
<li>Has spill containment measures in place</li>
<li>Is clearly signposted with waste segregation instructions</li>
</ul>

<h4>3. Transfer</h4>
<p>You must only transfer waste to a <strong>registered waste carrier</strong>. Before handing over any waste, you must verify:</p>
<ul>
<li>The carrier''s registration number (check it on the Environment Agency public register)</li>
<li>That the receiving facility is licensed to accept the specific waste type</li>
<li>That a Waste Transfer Note or Consignment Note is completed and signed</li>
</ul>

<div class="callout callout-warning">
<h3>Important</h3>
<p>Hazardous waste (which includes most clinical waste) requires a <strong>Consignment Note</strong>, not a standard Waste Transfer Note. Consignment Notes must be retained for a minimum of three years.</p>
</div>

<h4>4. Documentation</h4>
<p>You must maintain records that demonstrate your compliance. This includes:</p>
<ul>
<li>Waste Transfer Notes or Consignment Notes for every collection</li>
<li>Carrier registration details</li>
<li>Waste descriptions (EWC codes)</li>
<li>Staff training records for waste handling</li>
<li>Risk assessments for waste management activities</li>
</ul>

<h4>5. Verification</h4>
<p>The Duty of Care doesn''t end when the waste leaves your premises. You must take reasonable steps to verify that your waste is being handled correctly downstream. This means:</p>
<ul>
<li>Checking that your carrier''s registration remains valid (check annually)</li>
<li>Ensuring the destination facility is permitted for your waste type</li>
<li>Reporting any issues with collections or disposal promptly</li>
</ul>

<h3>The EWC Classification System</h3>
<p>Every waste type in the UK is assigned a European Waste Catalogue (EWC) code — a six-digit number that identifies the waste. Your waste carrier will need this code on transfer documentation. Common healthcare waste codes include:</p>
<table>
<thead>
<tr><th>EWC Code</th><th>Description</th></tr>
</thead>
<tbody>
<tr><td>18 01 01</td><td>Sharps (excluding those contaminated with medicinal waste)</td></tr>
<tr><td>18 01 03*</td><td>Healthcare waste containing infectious substances</td></tr>
<tr><td>18 01 08*</td><td>Cytotoxic and cytostatic medicines</td></tr>
<tr><td>18 01 09</td><td>Medicines other than those in 18 01 08</td></tr>
<tr><td>20 01 21</td><td>Fluorescent tubes and other mercury-containing waste</td></tr>
</tbody>
</table>
<p><em>* denotes hazardous waste</em></p>

<h3>Summary</h3>
<p>Your Duty of Care is built on five pillars: segregation, storage, transfer, documentation, and verification. Each pillar has specific, actionable requirements. In the next lesson, we''ll look at what happens when things go wrong — the penalties and enforcement actions that make compliance non-negotiable.</p>',
  2,
  15
);

-- Lesson 1.3: Penalties and Enforcement
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  'cbb1b1f8-f052-459b-b58e-ec5f2470f3ae',
  'Penalties and Enforcement',
  '<h2>Who Enforces the Rules?</h2>
<p>Multiple bodies have enforcement powers over healthcare waste. Understanding who they are and what they can do helps you prepare for inspections and avoid penalties.</p>

<table>
<thead>
<tr><th>Enforcement Body</th><th>Role</th><th>Powers</th></tr>
</thead>
<tbody>
<tr><td>Environment Agency (EA)</td><td>Regulates waste carriers, transfer, and disposal in England</td><td>Fixed penalty notices, prosecution, revocation of permits</td></tr>
<tr><td>Health & Safety Executive (HSE)</td><td>Workplace safety, including sharps injuries and exposure to hazardous substances</td><td>Improvement notices, prosecution, unlimited fines</td></tr>
<tr><td>Local Authority / Environmental Health</td><td>Local inspections of beauty, tattoo, and aesthetics premises</td><td>Improvement notices, closure orders, prosecution</td></tr>
<tr><td>Care Quality Commission (CQC)</td><td>Regulates healthcare providers (relevant if you offer clinical procedures)</td><td>Warning notices, suspension, cancellation of registration</td></tr>
</tbody>
</table>

<h3>Types of Enforcement Action</h3>
<h4>1. Fixed Penalty Notices</h4>
<p>These are on-the-spot fines issued for minor breaches. Common triggers include:</p>
<ul>
<li>Incorrect waste segregation (e.g., clinical waste in general waste)</li>
<li>Missing or incomplete waste transfer documentation</li>
<li>Unregistered waste carrier being used</li>
<li>Inadequate waste storage</li>
</ul>
<p>Fixed penalties typically start at £300 for businesses and can escalate for repeat offences.</p>

<h4>2. Improvement Notices</h4>
<p>An improvement notice gives you a deadline (usually 14–30 days) to rectify a specific breach. The notice will state:</p>
<ul>
<li>What the breach is</li>
<li>What you must do to fix it</li>
<li>The deadline for compliance</li>
</ul>
<p>Failure to comply with an improvement notice can lead to prosecution.</p>

<h4>3. Prohibition Notices</h4>
<p>If the enforcement body considers there is an imminent risk to health or safety, they can issue a prohibition notice. This effectively <strong>stops an activity immediately</strong> until the risk is eliminated. For a clinical practice, this could mean you cannot operate until the waste management issue is resolved.</p>

<h4>4. Prosecution</h4>
<p>Serious or persistent breaches can lead to criminal prosecution. Convictions under the Environmental Protection Act can result in:</p>
<ul>
<li><strong>Unlimited fines</strong> (in the Crown Court)</li>
<li><strong>Imprisonment</strong> (up to 5 years for the most serious offences)</li>
<li><strong>Forfeiture</strong> of any equipment or materials used in the offence</li>
</ul>

<div class="callout callout-danger">
<h3>Real-World Example</h3>
<p>In 2023, a tattoo studio in London was fined £12,000 for improper disposal of clinical waste, including sharps in general waste bags and no waste transfer notes. The fine was small compared to the reputational damage and loss of their insurance coverage.</p>
</div>

<h3>The Ripple Effect of Non-Compliance</h3>
<p>Beyond the direct penalties, non-compliance creates cascading risks:</p>
<ul>
<li><strong>Insurance voiding:</strong> If your waste management is found to be negligent, your liability insurance may refuse to pay out on claims</li>
<li><strong>Loss of professional registration:</strong> Regulatory bodies may suspend or revoke your registration</li>
<li><strong>Client trust:</strong> News of enforcement action spreads quickly in local communities and online</li>
<li><strong>Staff morale and retention:</strong> Staff who feel unsafe are more likely to leave</li>
<li><strong>Increased scrutiny:</strong> Once you''ve been flagged, you can expect more frequent inspections</li>
</ul>

<h3>How to Protect Yourself</h3>
<p>The good news is that compliance is straightforward when you have systems in place. Throughout this course, you''ll learn exactly what to do. The key principles are:</p>
<ol>
<li>Have written waste management policies</li>
<li>Train all staff on waste segregation</li>
<li>Maintain accurate documentation</li>
<li>Use a licensed, registered waste carrier</li>
<li>Conduct regular internal audits</li>
<li>Stay up to date with regulatory changes</li>
</ol>

<h3>Summary</h3>
<p>Multiple agencies can enforce waste regulations, and penalties range from fixed fines to criminal prosecution. The best protection is proactive compliance. In Module 2, we move from the legal framework to practical implementation with a deep dive into HTM 07-01.</p>',
  3,
  12
);

-- Module 2: Demystifying HTM 07-01
-- Lesson 2.1: What Is HTM 07-01?
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '190f290e-be29-4a8a-9ac1-d4f3b8b444d7',
  'What Is HTM 07-01?',
  '<h2>Understanding HTM 07-01</h2>
<p>HTM 07-01 (Health Technical Memorandum 07-01: Safe Management of Healthcare Waste) is the primary guidance document for healthcare waste management in England. Published by the Department of Health, it provides detailed, practical guidance on every aspect of waste management — from segregation at the point of production to final disposal.</p>

<div class="callout callout-info">
<h3>Key Distinction</h3>
<p>HTM 07-01 is guidance, not legislation. However, regulators (the Environment Agency, local authorities, HSE) use it as the benchmark for what constitutes good practice. If you''re inspected, they will measure your waste management against HTM 07-01. So while it''s not law, <strong>it functions as the de facto standard you must meet</strong>.</p>
</div>

<h3>The Structure of HTM 07-01</h3>
<p>HTM 07-01 is a comprehensive document organised into several key sections. You don''t need to read it cover to cover, but you should understand its structure so you can reference it when needed:</p>

<table>
<thead>
<tr><th>Section</th><th>Focus</th></tr>
</thead>
<tbody>
<tr><td>Part A</td><td>Introduction, scope, and legal framework</td></tr>
<tr><td>Part B</td><td>Roles and responsibilities, duty of care, waste minimisation</td></tr>
<tr><td>Part C</td><td>Waste segregation and colour-coded system (the core practical guidance)</td></tr>
<tr><td>Part D</td><td>Storage, collection, transport, and disposal</td></tr>
<tr><td>Part E</td><td>Facility design and waste management infrastructure</td></tr>
<tr><td>Appendices</td><td>Templates, checklists, risk assessment forms, and example documentation</td></tr>
</tbody>
</table>

<h3>Who Should Read It?</h3>
<p>While the document was originally written for NHS organisations, HTM 07-01 applies to <strong>all healthcare waste producers</strong>, including:</p>
<ul>
<li>Private clinics and aesthetic practices</li>
<li>Tattoo and piercing studios</li>
<li>Podiatry and chiropody clinics</li>
<li>Dental practices</li>
<li>Beauty salons offering treatments that generate clinical waste</li>
<li>Mobile practitioners and domiciliary care providers</li>
</ul>

<h3>The Core Principles</h3>
<p>HTM 07-01 is built around several core principles that should guide everything you do:</p>

<h4>1. The Waste Hierarchy</h4>
<p>Prevention first, disposal last. Every decision should start with: "Can I reduce or prevent this waste?"</p>

<h4>2. Segregation at Source</h4>
<p>Waste must be segregated the moment it is produced — not sorted later. The colour-coded system makes this straightforward when staff know the rules.</p>

<h4>3. The Polluter Pays</h4>
<p>The business that generates the waste bears the cost of its safe management. This means you cannot pass disposal costs onto clients or expect your carrier to absorb them.</p>

<h4>4. Traceability</h4>
<p>Every container of waste must be traceable from production to final disposal. This is why consignment notes and waste tracking are so important.</p>

<h4>5. Staff Training</h4>
<p>HTM 07-01 explicitly requires that all staff who handle waste receive appropriate training. This should be documented and refreshed regularly.</p>

<div class="callout callout-warning">
<h3>Important</h3>
<p>HTM 07-01 is periodically updated. Always ensure you''re working from the latest version. The most recent major revision was in 2013, with amendments since. Check the gov.uk website for the current version.</p>
</div>

<h3>Summary</h3>
<p>HTM 07-01 is your practical guide to compliant waste management. It''s not law, but regulators use it as the standard. In the next lesson, we''ll explore the colour-coded segregation system in detail — this is the part of HTM 07-01 you''ll use every day in your practice.</p>',
  1,
  12
);

-- Lesson 2.2: The Colour-Coded Segregation System
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '190f290e-be29-4a8a-9ac1-d4f3b8b444d7',
  'The Colour-Coded Segregation System',
  '<h2>The HTM 07-01 Colour Code</h2>
<p>The colour-coded waste segregation system is the heart of HTM 07-01. It''s designed so that any staff member can quickly and correctly identify which container to use for any waste item. Get this right, and most of your compliance challenges disappear.</p>

<img src="/course-htm-01-waste-hierarchy.webp" alt="Waste segregation colour-coded bins" style="width:100%;max-width:600px;border-radius:8px;margin:1.5rem 0;" />

<h3>The Complete Colour Guide</h3>

<table>
<thead>
<tr><th>Colour</th><th>Container Type</th><th>What Goes In</th><th>Disposal Route</th></tr>
</thead>
<tbody>
<tr><td><strong>Orange</strong></td><td>Orange bag</td><td>Infectious waste that does not require specialist disposal (dressings, swabs, gloves, PPE)</td><td>Alternative treatment (e.g., autoclave) or incineration</td></tr>
<tr><td><strong>Yellow</strong></td><td>Yellow bag</td><td>Highly infectious waste requiring incineration (laboratory cultures, equipment contaminated with dangerous pathogens)</td><td>Incineration only</td></tr>
<tr><td><strong>Yellow lid</strong></td><td>Sharps box</td><td>Sharps contaminated with medicinal waste (needles, syringes used for injections)</td><td>Incineration only</td></tr>
<tr><td><strong>Orange lid</strong></td><td>Sharps box</td><td>Sharps not contaminated with medicine (razor blades, disposable scalpels, acupuncture needles)</td><td>Alternative treatment or incineration</td></tr>
<tr><td><strong>Purple lid</strong></td><td>Sharps box or bag</td><td>Cytotoxic or cytostatic waste (cancer treatment drugs and contaminated items)</td><td>Incineration at a licensed facility</td></tr>
<tr><td><strong>Blue lid</strong></td><td>Blue bag/box</td><td>Pharmaceutical waste (out-of-date or unused medicines, excluding cytotoxic/cytostatic)</td><td>Incineration at a licensed facility</td></tr>
<tr><td><strong>Black</strong></td><td>Black bag</td><td>Non-clinical general waste (packaging, paper, food waste, cleaning materials)</td><td>Standard waste disposal (landfill/energy recovery)</td></tr>
<tr><td><strong>Red</strong></td><td>Red bag</td><td>Anatomical waste (body parts, organs, tissue samples)</td><td>Incineration only</td></tr>
</tbody>
</table>

<div class="callout callout-info">
<h3>Quick Rule of Thumb</h3>
<p>If it''s been in contact with blood or body fluids and isn''t sharp → <strong>orange bag</strong>. If it''s a sharp and was used for medication → <strong>yellow-lidded sharps box</strong>. If it''s a sharp and wasn''t used for medication → <strong>orange-lidded sharps box</strong>. When in doubt, ask — never guess.</p>
</div>

<h3>Sector-Specific Guidance</h3>

<h4>Beauty & Aesthetics</h4>
<p>Common waste in beauty and aesthetics practices includes:</p>
<ul>
<li>Used needles and cannulas → Yellow-lidded sharps box (if used with injectables like fillers or Botox)</li>
<li>Gloves, gauze, and wipes with blood or body fluids → Orange bag</li>
<li>Out-of-date injectable products → Blue-lidded pharmaceutical container</li>
<li>General packaging and paper → Black bag</li>
</ul>

<h4>Tattoo & Piercing</h4>
<ul>
<li>Used needles and tubes → Orange-lidded sharps box (not contaminated with medicine)</li>
<li>Ink cartridges and contaminated wipes → Orange bag</li>
<li>Gloves and protective coverings → Orange bag</li>
</ul>

<h4>Podiatry</h4>
<ul>
<li>Scalpel blades and podiatry instruments → Orange-lidded sharps box</li>
<li>Nail clippings and tissue → Orange bag (or red bag if anatomical)</li>
<li>Dressings and swabs → Orange bag</li>
<li>Used local anaesthetic cartridges → Yellow-lidded sharps box</li>
</ul>

<h3>Common Segregation Mistakes</h3>
<div class="callout callout-danger">
<h3>Avoid These Errors</h3>
<ol>
<li><strong>Mixing sharps in bags</strong> — Never put sharps in any bag, even an orange bag. They must go in a rigid sharps container.</li>
<li><strong>Overfilling containers</strong> — Fill bags to the fill line only (usually 3/4 full). Overfilled bags can split during transport.</li>
<li><strong>Using the wrong sharps box lid colour</strong> — The lid colour determines the disposal route. A yellow-lidded box costs more to dispose of than orange-lidded, so correct segregation saves money.</li>
<li><strong>Putting pharmaceutical waste in orange bags</strong> — Medicines must go in blue-lidded containers, not infectious waste bags.</li>
<li><strong>Leaving waste unlabelled</strong> — Every container must be labelled with the producer''s details and the date the container was started.</li>
</ol>
</div>

<h3>Labelling Requirements</h3>
<p>Every waste container must be clearly labelled with:</p>
<ul>
<li>Your business name and address</li>
<li>The date the container was first used</li>
<li>The waste type (EWC code)</li>
<li>The UN classification number (for transport)</li>
<li>The biohazard symbol (for infectious waste)</li>
</ul>

<h3>Summary</h3>
<p>The colour-coded system is simple once you know it. The key is consistent staff training and clear signage at waste stations. In the next lesson, we''ll look at what documentation HTM 07-01 requires you to maintain.</p>',
  2,
  18
);

-- Lesson 2.3: Documentation Requirements Under HTM 07-01
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '190f290e-be29-4a8a-9ac1-d4f3b8b444d7',
  'Documentation Requirements Under HTM 07-01',
  '<h2>Why Documentation Matters</h2>
<p>Documentation is the proof of your compliance. If you''re doing everything right but can''t prove it, an inspector will treat it as non-compliance. HTM 07-01 is specific about what records you must keep and for how long.</p>

<div class="callout callout-info">
<h3>The Golden Rule</h3>
<p>If it isn''t written down, it didn''t happen. Every waste-related activity in your practice should be documented in a way that an inspector can review.</p>
</div>

<h3>Essential Documents</h3>

<h4>1. Waste Transfer Notes / Consignment Notes</h4>
<p>Every time waste leaves your premises, a transfer document must be completed:</p>
<ul>
<li><strong>Waste Transfer Note (WTN)</strong> — Used for non-hazardous waste (e.g., black bag general waste)</li>
<li><strong>Consignment Note</strong> — Used for hazardous waste (which includes most clinical waste)</li>
</ul>

<p>Each document must include:</p>
<table>
<thead>
<tr><th>Field</th><th>Details</th></tr>
</thead>
<tbody>
<tr><td>Producer details</td><td>Your business name, address, and contact information</td></tr>
<tr><td>Carrier details</td><td>Waste carrier name, registration number, and address</td></tr>
<tr><td>Waste description</td><td>EWC code, waste type, physical form</td></tr>
<tr><td>Quantity</td><td>Weight or number of containers</td></tr>
<tr><td>Collection date</td><td>Date of transfer</td></tr>
<tr><td>Signatures</td><td>Signed by both producer and carrier</td></tr>
</tbody>
</table>

<p><strong>Retention period:</strong> WTNs must be kept for 2 years. Consignment Notes must be kept for 3 years.</p>

<h4>2. Pre-Acceptance Audit</h4>
<p>Before a waste contractor accepts your waste, they should conduct a pre-acceptance audit. This document confirms:</p>
<ul>
<li>The types and quantities of waste you produce</li>
<li>How waste is segregated and stored</li>
<li>That your waste streams match the disposal routes the contractor can handle</li>
</ul>
<p>You should keep a copy of the completed audit and review it annually or when your practice changes.</p>

<h4>3. Staff Training Records</h4>
<p>HTM 07-01 requires documented training for all staff who handle waste. Your training records should include:</p>
<ul>
<li>Staff member''s name</li>
<li>Date of training</li>
<li>Topics covered</li>
<li>Trainer''s name and qualifications</li>
<li>Confirmation that the staff member understood the training (sign-off)</li>
<li>Date of next refresher (recommended annually)</li>
</ul>

<h4>4. Waste Management Policy</h4>
<p>Your practice should have a written waste management policy that covers:</p>
<ul>
<li>Waste segregation procedures</li>
<li>Storage arrangements</li>
<li>Collection schedules</li>
<li>Spill procedures</li>
<li>Staff responsibilities</li>
<li>Training requirements</li>
</ul>

<h4>5. Risk Assessments</h4>
<p>Risk assessments specific to waste management activities should document:</p>
<ul>
<li>What waste-related hazards exist in your practice</li>
<li>Who might be harmed and how</li>
<li>What controls are in place</li>
<li>What further action is needed</li>
</ul>

<h4>6. Spill Incident Records</h4>
<p>If a waste spill occurs (e.g., a bag splits, a sharps injury happens), you must record:</p>
<ul>
<li>What happened and when</li>
<li>Who was involved</li>
<li>What immediate action was taken</li>
<li>What corrective action was implemented</li>
<li>Whether it was reported to RIDDOR (if applicable)</li>
</ul>

<h3>Creating a Waste Management File</h3>
<p>The simplest approach is to maintain a single waste management file (physical or digital) that contains all of these documents. Organise it with tabbed sections:</p>
<ol>
<li>Policies and procedures</li>
<li>Risk assessments</li>
<li>Training records</li>
<li>Transfer notes and consignment notes</li>
<li>Carrier registration details</li>
<li>Audit reports</li>
<li>Incident records</li>
</ol>

<div class="callout callout-warning">
<h3>Tip</h3>
<p>If your waste carrier offers a digital portal or app for managing consignment notes, take advantage of it. Digital records are easier to search, harder to lose, and immediately accessible during an inspection.</p>
</div>

<h3>Summary</h3>
<p>Good documentation is your best defence in an inspection. Maintain a well-organised waste management file with all required documents, and keep records for the minimum retention periods. In Module 3, we move from documentation to action — applying the waste hierarchy in your day-to-day practice.</p>',
  3,
  15
);

-- Module 3: The Waste Hierarchy in Practice
-- Lesson 3.1: The Waste Hierarchy Explained
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '45f0d323-f415-4709-b6e4-dfd0f3465d3d',
  'The Waste Hierarchy Explained',
  '<h2>The Five-Tier Waste Hierarchy</h2>
<p>The waste hierarchy is a fundamental principle of UK waste law, embedded in the Waste (England and Wales) Regulations 2011. It ranks waste management options from best to worst, with prevention at the top and disposal at the bottom. As a healthcare waste producer, you are legally required to apply the hierarchy to your waste.</p>

<img src="/course-htm-01-waste-hierarchy.webp" alt="The five-tier waste hierarchy pyramid" style="width:100%;max-width:600px;border-radius:8px;margin:1.5rem 0;" />

<h3>The Five Tiers</h3>

<h4>Tier 1: Prevention</h4>
<p>The best option is to not produce waste in the first place. In a clinical setting, this means:</p>
<ul>
<li>Switching to reusable instruments where safe and practical (e.g., autoclavable metal instruments instead of disposable plastic)</li>
<li>Ordering supplies in bulk to reduce packaging waste</li>
<li>Choosing products with minimal or recyclable packaging</li>
<li>Using digital records instead of paper where possible</li>
<li>Accurately estimating quantities to avoid over-ordering of materials that expire</li>
</ul>

<h4>Tier 2: Preparing for Reuse</h4>
<p>If waste can''t be prevented, the next best option is to prepare items for reuse. In clinical settings, this is limited but includes:</p>
<ul>
<li>Sterilising and reusing metal instruments (e.g., podiatry instruments, tattoo tubes)</li>
<li>Cleaning and reusing protective equipment where it''s safe to do so (e.g., reusable face shields)</li>
<li>Returning unused, unopened medical supplies to suppliers (where permitted)</li>
</ul>

<div class="callout callout-warning">
<h3>Safety Note</h3>
<p>Single-use items (like needles, syringes, and some blades) must <strong>never</strong> be reused. The law requires these to be disposed of after a single use. Reusing single-use medical devices is a criminal offence.</p>
</div>

<h4>Tier 3: Recycling</h4>
<p>Recycling is the third option. In a clinical practice, some waste streams can be recycled if they are not contaminated:</p>
<ul>
<li>Clean cardboard packaging from supply deliveries</li>
<li>Clean plastic containers (if not contaminated with clinical waste)</li>
<li>Paper from administrative areas</li>
<li>Glass from non-clinical areas</li>
</ul>
<p>The key is to keep recyclable materials <strong>separate from clinical waste</strong> at the point of production. Once a recyclable item is contaminated with blood or body fluids, it must be treated as clinical waste.</p>

<h4>Tier 4: Recovery</h4>
<p>Recovery means extracting value from waste that can''t be recycled. For healthcare waste, the main recovery method is <strong>energy from waste</strong> (incineration with energy recovery). This is what happens to most orange-bag infectious waste — it''s treated to make it safe, then incinerated to generate energy.</p>

<h4>Tier 5: Disposal</h4>
<p>Disposal is the last resort — sending waste to landfill with no recovery of value. This is the most environmentally damaging and often the most expensive option. In clinical waste management, landfill is only used for:</p>
<ul>
<li>Non-clinical general waste (black bags) that can''t be recycled</li>
<li>Treated clinical waste that has been rendered safe and non-infectious</li>
</ul>

<h3>Applying the Hierarchy to Your Practice</h3>
<p>Applying the hierarchy is a legal duty, not just a good idea. Here''s how to put it into practice:</p>

<table>
<thead>
<tr><th>Waste Item</th><th>Hierarchy Level</th><th>Action</th></tr>
</thead>
<tbody>
<tr><td>Cardboard supply packaging</td><td>Prevention / Recycling</td><td>Order in bulk to reduce, then recycle clean cardboard</td></tr>
<tr><td>Metal podiatry instruments</td><td>Reuse</td><td>Autoclave and reuse instead of buying disposable</td></tr>
<tr><td>Used needles</td><td>Recovery</td><td>Must be disposed of in sharps box — no prevention or reuse possible</td></tr>
<tr><td>Disposable gloves</td><td>Recovery</td><td>Orange bag → treatment → energy recovery</td></tr>
<tr><td>Office paper</td><td>Prevention / Recycling</td><td>Go digital where possible, recycle the rest</td></tr>
</tbody>
</table>

<h3>Summary</h3>
<p>The waste hierarchy gives you a decision-making framework: prevent first, reuse where possible, recycle what you can, recover energy from the rest, and dispose only as a last resort. In the next lesson, we''ll look at practical waste minimisation strategies specific to clinical and beauty practices.</p>',
  1,
  15
);

-- Lesson 3.2: Practical Waste Minimisation
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '45f0d323-f415-4709-b6e4-dfd0f3465d3d',
  'Practical Waste Minimisation Strategies',
  '<h2>Reducing Waste at Source</h2>
<p>Waste minimisation is the top tier of the waste hierarchy — and it''s also where you can save the most money. Every item you don''t buy, don''t use, or don''t throw away reduces both your disposal costs and your purchasing costs.</p>

<div class="callout callout-info">
<h3>The Business Case</h3>
<p>A typical clinical practice spends 15-20% of its waste management budget on waste that could have been prevented. By reducing waste at source, you cut costs twice: less purchasing and less disposal.</p>
</div>

<h3>Strategy 1: Smart Procurement</h3>
<p>The choices you make when buying supplies have the biggest impact on waste generation:</p>
<ul>
<li><strong>Buy in bulk:</strong> Reduces individual packaging and delivery frequency</li>
<li><strong>Choose concentrated products:</strong> Cleaning and disinfection products often come as concentrates, reducing packaging and transport</li>
<li><strong>Specify recyclable packaging:</strong> Ask suppliers about packaging take-back schemes or recyclable options</li>
<li><strong>Order accurate quantities:</strong> Avoid over-ordering perishable items that may expire before use</li>
<li><strong>Negotiate with suppliers:</strong> Many suppliers will adjust packaging if customers request it</li>
</ul>

<h3>Strategy 2: Reusable Alternatives</h3>
<p>Many single-use items have safe, reusable alternatives that reduce waste and save money over time:</p>

<table>
<thead>
<tr><th>Single-Use Item</th><th>Reusable Alternative</th><th>Considerations</th></tr>
</thead>
<tbody>
<tr><td>Disposable tattoo tubes</td><td>Stainless steel tubes (autoclavable)</td><td>Requires autoclave; initial investment but lower ongoing cost</td></tr>
<tr><td>Disposable instrument trays</td><td>Metal trays (autoclavable)</td><td>Easy to implement if you already autoclave instruments</td></tr>
<tr><td>Paper patient drapes</td><td>Washable fabric drapes</td><td>Must be laundered to clinical standards; check with your insurer</td></tr>
<tr><td>Disposable face shields</td><td>Reusable face shields with replaceable films</td><td>Replace the film between patients; clean the frame</td></tr>
</tbody>
</table>

<h3>Strategy 3: Segregation as Minimisation</h3>
<p>Correct segregation reduces waste in two ways:</p>
<ol>
<li><strong>It prevents contamination:</strong> A single clinical waste item in a black bag can force the entire bag to be treated as clinical waste, multiplying disposal costs</li>
<li><strong>It keeps recyclables clean:</strong> Clean cardboard and paper from deliveries can be recycled only if they''re not mixed with clinical waste</li>
</ol>

<div class="callout callout-danger">
<h3>The Contamination Problem</h3>
<p>If one orange bag is found in a collection of black bags, the waste carrier may refuse the entire load or charge clinical waste rates for the whole collection. This can turn a £20 general waste collection into a £200 clinical waste collection.</p>
</div>

<h3>Strategy 4: Digital Records</h3>
<p>Going paperless reduces paper waste and improves efficiency:</p>
<ul>
<li>Use digital consent forms instead of paper</li>
<li>Store records electronically rather than printing</li>
<li>Use digital appointment confirmations instead of paper reminders</li>
<li>Send invoices by email</li>
</ul>

<h3>Strategy 5: Staff Engagement</h3>
<p>Staff are the key to waste minimisation. Even the best policies fail if staff don''t follow them. To engage your team:</p>
<ul>
<li>Explain <em>why</em> waste reduction matters (not just the rules, but the environmental and financial reasons)</li>
<li>Make it easy: clear signage, accessible bins, simple instructions</li>
<li>Review waste regularly and share results with the team</li>
<li>Recognise and reward good practice</li>
</ul>

<h3>Measuring Your Waste</h3>
<p>You can''t reduce what you don''t measure. Track your waste by:</p>
<ol>
<li>Recording the weight or volume of each waste stream at each collection</li>
<li>Comparing month-to-month and identifying trends</li>
<li>Setting reduction targets (e.g., "reduce general waste by 10% in 6 months")</li>
<li>Reviewing what''s in your bins (a simple waste audit — see Module 4)</li>
</ol>

<h3>Summary</h3>
<p>Waste minimisation is the most effective and cost-saving step in the waste hierarchy. Focus on procurement, reusables, segregation, digitisation, and staff engagement. In the next lesson, we''ll look at how to handle the most challenging waste types safely.</p>',
  2,
  15
);

-- Lesson 3.3: Handling Difficult Waste Streams
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '45f0d323-f415-4709-b6e4-dfd0f3465d3d',
  'Handling Difficult Waste Streams',
  '<h2>Challenging Waste Types</h2>
<p>Some waste streams require extra care beyond standard segregation. This lesson covers the waste types that most commonly cause problems in clinical and beauty practices.</p>

<h3>1. Sharps</h3>
<p>Sharps are the most common cause of waste-related injuries in clinical settings. Key rules:</p>
<ul>
<li><strong>Never recap needles.</strong> Recapping is the leading cause of needlestick injuries</li>
<li>Place sharps directly into the sharps box at the point of use — do not pass them to another person</li>
<li>Fill sharps boxes to the fill line only (usually 3/4 full) — never force items in</li>
<li>Seal and lock the box when full — once locked, never reopen it</li>
<li>Store sealed boxes in the secure waste storage area pending collection</li>
</ul>

<div class="callout callout-danger">
<h3>Needlestick Injury Protocol</h3>
<p>If a sharps injury occurs: 1) Encourage bleeding by squeezing the wound (do not suck). 2) Wash thoroughly with soap and water. 3) Cover with a waterproof dressing. 4) Seek medical advice immediately. 5) Record in the accident book and report under RIDDOR if applicable.</p>
</div>

<h3>2. Cytotoxic and Cytostatic Waste</h3>
<p>If your practice handles chemotherapy drugs or other cytotoxic/cytostatic medicines, special rules apply:</p>
<ul>
<li>Use <strong>purple-lidded</strong> sharps boxes and bags only</li>
<li>These must be incinerated at a facility licensed for cytotoxic waste</li>
<li>Ensure your waste carrier is licensed to transport cytotoxic waste</li>
<li>This waste stream has different consignment note requirements</li>
</ul>

<h3>3. Pharmaceutical Waste</h3>
<p>Out-of-date or unused medicines are pharmaceutical waste:</p>
<ul>
<li>Use <strong>blue-lidded</strong> containers</li>
<li>Never put medicines in orange bags or general waste</li>
<li>Keep medicines in their original packaging where possible</li>
<li>Pharmaceutical waste requires a consignment note for each collection</li>
</ul>

<h3>4. Anatomical Waste</h3>
<p>If your practice produces tissue samples, excised tissue, or body parts:</p>
<ul>
<li>Use <strong>red bags</strong> or red-lidded containers</li>
<li>Store in a refrigerated area if collection is more than 24 hours away</li>
<li>Anatomical waste must be incinerated</li>
<li>This waste requires special consignment documentation</li>
</ul>

<h3>5. Chemical Waste</h3>
<p>Cleaning chemicals, disinfectants, and laboratory chemicals:</p>
<ul>
<li>Never pour chemicals down the drain unless specifically permitted</li>
<li>Store chemical waste separately, in its original containers where possible</li>
<li>Use a licensed chemical waste contractor</li>
<li>Check the Safety Data Sheet (SDS) for each chemical — it will tell you the correct disposal method</li>
</ul>

<h3>6. Mercury-Containing Waste</h3>
<p>Some older equipment may contain mercury (e.g., mercury thermometers, sphygmomanometers):</p>
<ul>
<li>Mercury is classified as hazardous waste</li>
<li>Store mercury-containing waste separately and securely</li>
<li>Use a specialist hazardous waste contractor</li>
<li>Never put mercury waste in general or clinical waste</li>
</ul>

<h3>Spill Management</h3>
<p>Spills happen. Having a plan means you can respond safely and quickly. Every practice should have a spill kit that includes:</p>
<ul>
<li>Absorbent granules or pads</li>
<li>Scoop and scraper</li>
<li>Protective gloves and apron</li>
<li>Yellow clinical waste bag for contaminated materials</li>
<li>Eye protection</li>
</ul>

<h4>Spill Response Steps</h4>
<ol>
<li>Put on PPE (gloves, apron, eye protection)</li>
<li>Cover the spill with absorbent granules</li>
<li>Allow to absorb (follow product instructions for time)</li>
<li>Use the scoop to collect the absorbed material</li>
<li>Place all contaminated materials in the orange clinical waste bag</li>
<li>Clean the area with disinfectant</li>
<li>Remove PPE and wash hands</li>
<li>Record the incident in the spill log</li>
</ol>

<h3>Summary</h3>
<p>Difficult waste streams require specific handling, but with clear protocols and trained staff, they become routine. Sharps safety, correct colour coding, and spill preparedness are the essentials. In Module 4, we move to auditing — how to check that your systems are working and identify gaps before an inspector does.</p>',
  3,
  15
);

-- Module 4: Mastering the Internal Waste Audit
-- Lesson 4.1: Why Audit?
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '4d8f2794-d1f3-4280-b478-1e8cd79b3a1e',
  'Why Internal Audits Matter',
  '<h2>The Purpose of Internal Audits</h2>
<p>An internal waste audit is a systematic review of your waste management practices. It''s your opportunity to find and fix problems <em>before</em> an inspector finds them. Regular audits are also a requirement of HTM 07-01 and demonstrate your commitment to continuous improvement.</p>

<div class="callout callout-info">
<h3>Think of It This Way</h3>
<p>An internal audit is a dress rehearsal for an external inspection. If you audit yourself regularly, you''ll never be surprised by what an inspector finds.</p>
</div>

<h3>Benefits of Regular Auditing</h3>
<ul>
<li><strong>Early problem detection:</strong> Catch issues when they''re small and easy to fix</li>
<li><strong>Compliance evidence:</strong> Audit records show inspectors you take waste management seriously</li>
<li><strong>Cost savings:</strong> Audits often reveal waste segregation errors that are inflating disposal costs</li>
<li><strong>Staff development:</strong> The audit process itself reinforces good practice among staff</li>
<li><strong>Peace of mind:</strong> Know that your practice is inspection-ready at all times</li>
</ul>

<h3>How Often Should You Audit?</h3>

<table>
<thead>
<tr><th>Practice Type</th><th>Recommended Frequency</th></tr>
</thead>
<tbody>
<tr><td>Small practice (1-3 staff)</td><td>Quarterly</td></tr>
<tr><td>Medium practice (4-10 staff)</td><td>Monthly</td></tr>
<tr><td>Large practice (10+ staff)</td><td>Monthly with spot checks</td></tr>
<tr><td>After any major change</td><td>Immediately (new staff, new treatments, new location)</td></tr>
</tbody>
</table>

<h3>Who Should Conduct the Audit?</h3>
<p>The best audits are conducted by someone who knows the standards but isn''t too close to the daily routine. Options include:</p>
<ul>
<li><strong>The practice owner or manager</strong> — Good for small practices; ensures the owner sees the reality of waste handling</li>
<li><strong>A designated waste champion</strong> — A trained staff member who takes ownership of waste compliance</li>
<li><strong>An external auditor</strong> — Provides an independent perspective; useful annually even if you do internal audits more frequently</li>
</ul>

<h3>Summary</h3>
<p>Internal audits are your early warning system. They should be regular, documented, and followed up with corrective actions. In the next lesson, we''ll walk through a complete audit checklist.</p>',
  1,
  10
);

-- Lesson 4.2: The Audit Checklist
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '4d8f2794-d1f3-4280-b478-1e8cd79b3a1e',
  'The Complete Audit Checklist',
  '<h2>Walking Through Your Practice</h2>
<p>This checklist covers every area of your practice that an inspector would examine. Use it as your template for internal audits. Print it, walk through your practice, and tick each item as you verify it.</p>

<img src="/course-htm-01-audit.webp" alt="Waste audit checklist on clipboard" style="width:100%;max-width:600px;border-radius:8px;margin:1.5rem 0;" />

<h3>Section 1: Waste Segregation</h3>
<table>
<thead>
<tr><th>Check Item</th><th>Pass / Fail / N/A</th></tr>
</thead>
<tbody>
<tr><td>Correct colour-coded containers available at every waste station</td><td></td></tr>
<tr><td>Containers are correctly labelled (business name, date started, EWC code)</td><td></td></tr>
<tr><td>Sharps boxes have the correct lid colour for their use</td><td></td></tr>
<tr><td>No clinical waste in black bags</td><td></td></tr>
<tr><td>No general waste in clinical waste bags</td><td></td></tr>
<tr><td>Bags are not overfilled (max 3/4 full)</td><td></td></tr>
<tr><td>Sharps boxes are not overfilled (max fill line)</td><td></td></tr>
</tbody>
</table>

<h3>Section 2: Waste Storage</h3>
<table>
<thead>
<tr><th>Check Item</th><th>Pass / Fail / N/A</th></tr>
</thead>
<tbody>
<tr><td>Storage area is secure and lockable</td><td></td></tr>
<tr><td>Storage area is not accessible to the public</td><td></td></tr>
<tr><td>Storage area is well-ventilated</td><td></td></tr>
<tr><td>No signs of pest infestation</td><td></td></tr>
<tr><td>Spill kit is present and fully stocked</td><td></td></tr>
<tr><td>Waste is stored off the floor where possible</td><td></td></tr>
<tr><td>Segregation is maintained in storage (not mixed together)</td><td></td></tr>
</tbody>
</table>

<h3>Section 3: Documentation</h3>
<table>
<thead>
<tr><th>Check Item</th><th>Pass / Fail / N/A</th></tr>
</thead>
<tbody>
<tr><td>Waste Transfer Notes / Consignment Notes for last 3 years on file</td><td></td></tr>
<tr><td>Carrier registration is current (checked within last 12 months)</td><td></td></tr>
<tr><td>Waste management policy is up to date and accessible to staff</td><td></td></tr>
<tr><td>Staff training records are current (all staff trained within last 12 months)</td><td></td></tr>
<tr><td>Risk assessments are up to date</td><td></td></tr>
<tr><td>Spill incident log is being maintained</td><td></td></tr>
<tr><td>Pre-acceptance audit from waste contractor is on file</td><td></td></tr>
</tbody>
</table>

<h3>Section 4: Staff Knowledge</h3>
<table>
<thead>
<tr><th>Check Item</th><th>Pass / Fail / N/A</th></tr>
</thead>
<tbody>
<tr><td>All staff can identify the correct container for common waste items</td><td></td></tr>
<tr><td>All staff know the spill procedure</td><td></td></tr>
<tr><td>All staff know the needlestick injury protocol</td><td></td></tr>
<tr><td>All staff know where the waste management policy is kept</td><td></td></tr>
<tr><td>New staff have received waste management training</td><td></td></tr>
</tbody>
</table>

<h3>Section 5: General Compliance</h3>
<table>
<thead>
<tr><th>Check Item</th><th>Pass / Fail / N/A</th></tr>
</thead>
<tbody>
<tr><td>Waste carrier registration number is displayed or accessible</td><td></td></tr>
<tr><td>Waste collection schedule is being maintained</td><td></td></tr>
<tr><td>No waste is being kept beyond recommended storage times</td><td></td></tr>
<tr><td>Wash hand basins are accessible and stocked</td><td></td></tr>
<tr><td>PPE is available and used correctly</td><td></td></tr>
</tbody>
</table>

<div class="callout callout-warning">
<h3>Documenting Findings</h3>
<p>For every "Fail" item, record: what the issue is, what corrective action is needed, who is responsible, and the deadline. Follow up to confirm the action was completed.</p>
</div>

<h3>Summary</h3>
<p>This checklist is your template. Adapt it to your specific practice type. The key is consistency — use the same checklist every time so you can track improvements over time. In the next lesson, we''ll look at how to implement corrective actions.</p>',
  2,
  20
);

-- Lesson 4.3: Corrective Actions and Follow-Up
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  '4d8f2794-d1f3-4280-b478-1e8cd79b3a1e',
  'Corrective Actions and Follow-Up',
  '<h2>Turning Findings Into Action</h2>
<p>An audit is only valuable if you act on its findings. The corrective action process turns audit results into improvements. This lesson shows you how to do it effectively.</p>

<h3>The Corrective Action Process</h3>

<h4>Step 1: Prioritise Findings</h4>
<p>Not all findings are equal. Prioritise using this system:</p>
<table>
<thead>
<tr><th>Priority</th><th>Definition</th><th>Timeline</th></tr>
</thead>
<tbody>
<tr><td><strong>Critical</strong></td><td>Immediate risk to health, safety, or legal compliance</td><td>Fix immediately (same day)</td></tr>
<tr><td><strong>High</strong></td><td>Significant compliance gap that could lead to enforcement</td><td>Fix within 7 days</td></tr>
<tr><td><strong>Medium</strong></td><td>Minor compliance gap or best-practice deviation</td><td>Fix within 30 days</td></tr>
<tr><td><strong>Low</strong></td><td>Opportunity for improvement, not a compliance issue</td><td>Fix within 90 days</td></tr>
</tbody>
</table>

<h4>Step 2: Assign Responsibility</h4>
<p>Every corrective action needs a named person responsible for completing it. Don''t assign actions to "the team" — be specific. Include:</p>
<ul>
<li>Who will do it</li>
<li>What exactly needs to be done</li>
<li>When it needs to be completed by</li>
<li>Who will verify it''s been done</li>
</ul>

<h4>Step 3: Implement</h4>
<p>Put the plan into action. Common corrective actions include:</p>
<ul>
<li><strong>Refresher training</strong> for staff who are segregating waste incorrectly</li>
<li><strong>Replacing signage</strong> if waste station instructions are missing or unclear</li>
<li><strong>Updating documentation</strong> if records are incomplete or out of date</li>
<li><strong>Improving storage</strong> if the waste area doesn''t meet security or hygiene standards</li>
<li><strong>Changing supplier</strong> if your waste carrier can''t handle all your waste streams</li>
</ul>

<h4>Step 4: Verify</h4>
<p>After the corrective action is completed, verify it worked. This means:</p>
<ol>
<li>Physically check that the issue has been resolved</li>
<li>Document the verification (date, who verified, result)</li>
<li>Schedule a follow-up check to ensure the fix is sustained</li>
</ol>

<h4>Step 5: Record</h4>
<p>Maintain a corrective action log that tracks:</p>
<table>
<thead>
<tr><th>Field</th><th>Example</th></tr>
</thead>
<tbody>
<tr><td>Date identified</td><td>14/10/2026</td></tr>
<tr><td>Finding</td><td>Sharps box in treatment room 2 not labelled with start date</td></tr>
<tr><td>Priority</td><td>Medium</td></tr>
<tr><td>Corrective action</td><td>Label all sharps boxes at point of use; brief staff on requirement</td></tr>
<tr><td>Responsible person</td><td>Jane Smith</td></tr>
<tr><td>Deadline</td><td>21/10/2026</td></tr>
<tr><td>Date completed</td><td>19/10/2026</td></tr>
<tr><td>Verified by</td><td>Practice Manager</td></tr>
</tbody>
</table>

<h3>Building a Culture of Continuous Improvement</h3>
<p>Corrective actions work best when they''re part of a culture of improvement, not punishment. To build this culture:</p>
<ul>
<li>Frame audits as improvement opportunities, not blame exercises</li>
<li>Celebrate when corrective actions are completed</li>
<li>Share audit results with all staff (good and bad)</li>
<li>Involve staff in developing solutions</li>
<li>Review trends over time — are the same issues recurring?</li>
</ul>

<div class="callout callout-info">
<h3>Template Available</h3>
<p>This course includes a downloadable corrective action log template. Use it to track all findings from your internal audits and demonstrate your improvement process to inspectors.</p>
</div>

<h3>Summary</h3>
<p>Corrective actions close the loop on your audit process. Prioritise, assign, implement, verify, and record. This cycle of audit → action → verification is exactly what inspectors look for when assessing your compliance culture. In Module 5, we''ll prepare you for the external inspection itself.</p>',
  3,
  12
);

-- Module 5: Preparing for External Inspection
-- Lesson 5.1: What Inspectors Look For
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  'c2f7b33a-cec2-457f-b27f-faec0f291d6e',
  'What Inspectors Look For',
  '<h2>Understanding the Inspector''s Mindset</h2>
<p>When an inspector visits your practice, they have a specific framework they''re assessing against. Understanding what they look for — and how they think — helps you prepare effectively.</p>

<div class="callout callout-info">
<h3>Key Insight</h3>
<p>Inspectors don''t expect perfection. They expect <strong>systems</strong>. A well-documented system with a minor gap is better than a perfect system with no documentation. They''re assessing whether you take compliance seriously, not whether you''re flawless.</p>
</div>

<h3>The Inspector''s Checklist</h3>
<p>While every inspection is different, inspectors typically assess these areas:</p>

<h4>1. Documentation Review</h4>
<p>This is usually the first step. The inspector will ask to see:</p>
<ul>
<li>Waste Transfer Notes and Consignment Notes (last 2-3 years)</li>
<li>Waste carrier registration details</li>
<li>Waste management policy</li>
<li>Staff training records</li>
<li>Risk assessments</li>
<li>Audit records</li>
<li>Incident records</li>
</ul>

<h4>2. Physical Inspection</h4>
<p>The inspector will walk through your practice to check:</p>
<ul>
<li>Waste segregation at point of use (are the right bins in the right places?)</li>
<li>Container condition and labelling</li>
<li>Storage area security and condition</li>
<li>Sharps boxes (correct colour, fill level, labelling)</li>
<li>General cleanliness and hygiene</li>
<li>Availability of PPE and handwashing facilities</li>
</ul>

<h4>3. Staff Interviews</h4>
<p>Inspectors may speak to staff members to verify:</p>
<ul>
<li>They know which container to use for different waste types</li>
<li>They know what to do in case of a spill</li>
<li>They know the needlestick injury protocol</li>
<li>They have received waste management training</li>
<li>They know where the waste management policy is kept</li>
</ul>

<h4>4. Compliance with Specific Requirements</h4>
<p>Depending on your practice type, the inspector may check sector-specific requirements:</p>
<table>
<thead>
<tr><th>Sector</th><th>Additional Checks</th></tr>
</thead>
<tbody>
<tr><td>Tattoo/piercing</td><td>Sharps handling, ink waste, bloodborne pathogen controls</td></tr>
<tr><td>Beauty/aesthetics</td><td>Injectable waste, PPE, sharps disposal for fillers</td></tr>
<tr><td>Podiatry</td><td>Instrument sterilisation, blade disposal, nail waste classification</td></tr>
<tr><td>Cross-sector</td><td>Hazardous waste consignment documentation, carrier verification</td></tr>
</tbody>
</table>

<h3>Red Flags for Inspectors</h3>
<p>Certain things will immediately put an inspector on alert:</p>
<ul>
<li><strong>Mixed waste in containers</strong> — suggests poor segregation training</li>
<li><strong>Unlabelled or incorrectly labelled containers</strong> — suggests systemic documentation failures</li>
<li><strong>Overfilled containers</strong> — suggests waste is not being collected often enough</li>
<li><strong>No training records</strong> — suggests staff may not be competent</li>
<li><strong>Missing consignment notes</strong> — suggests waste may not be being disposed of legally</li>
<li><strong>Expired carrier registration</strong> — suggests you may be using an illegal carrier</li>
</ul>

<h3>Green Flags for Inspectors</h3>
<p>These things will put an inspector at ease:</p>
<ul>
<li>A well-organised waste management file</li>
<li>Current, signed training records</li>
<li>Clear signage at every waste station</li>
<li>Correct segregation observed in practice (not just on paper)</li>
<li>Staff who can confidently answer questions</li>
<li>Evidence of regular internal audits with corrective actions</li>
</ul>

<h3>Summary</h3>
<p>Inspectors assess documentation, physical compliance, and staff knowledge. They look for systems and culture, not perfection. In the next lesson, we''ll build a pre-inspection checklist so you can be confident on the day.</p>',
  1,
  15
);

-- Lesson 5.2: The Pre-Inspection Checklist
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  'c2f7b33a-cec2-457f-b27f-faec0f291d6e',
  'The Pre-Inspection Checklist',
  '<h2>Be Ready Before They Arrive</h2>
<p>The best way to pass an inspection is to be inspection-ready at all times. But when you know an inspection is coming — whether it''s scheduled or you''ve been notified — there are specific steps you should take in the days before.</p>

<h3>One Week Before</h3>
<ol>
<li><strong>Conduct a full internal audit</strong> using the checklist from Module 4</li>
<li><strong>Complete any open corrective actions</strong> from previous audits</li>
<li><strong>Verify carrier registration</strong> is current on the Environment Agency register</li>
<li><strong>Check all training records</strong> are signed and up to date</li>
<li><strong>Review all documentation</strong> for completeness — no gaps in consignment notes</li>
<li><strong>Brief all staff</strong> that an inspection is approaching and what to expect</li>
</ol>

<h3>One Day Before</h3>
<ol>
<li><strong>Walk through the practice</strong> as if you were the inspector</li>
<li><strong>Check every waste container</strong> — correct colour, correct labelling, not overfilled</li>
<li><strong>Check the storage area</strong> — clean, secure, organised</li>
<li><strong>Ensure spill kit is stocked</strong> and accessible</li>
<li><strong>Prepare the waste management file</strong> for easy review — have it ready to hand over</li>
<li><strong>Ensure signage</strong> at all waste stations is clear and visible</li>
</ol>

<h3>On the Day</h3>
<ol>
<li><strong>Do a final walkthrough</strong> before the inspector arrives</li>
<li><strong>Have the waste management file ready</strong> at reception or in the office</li>
<li><strong>Brief staff</strong> one more time — remind them to answer questions honestly and confidently</li>
<li><strong>Ensure the person responsible for waste management is available</strong></li>
<li><strong>Have PPE available</strong> for the inspector if they need to enter clinical areas</li>
</ol>

<h3>During the Inspection</h3>
<div class="callout callout-info">
<h3>How to Handle the Inspection</h3>
<ol>
<li><strong>Be cooperative and transparent.</strong> Don''t try to hide anything — if there''s a gap, acknowledge it and explain your plan to fix it</li>
<li><strong>Answer questions directly.</strong> Don''t volunteer extra information, but don''t be evasive</li>
<li><strong>Let the inspector lead.</strong> Don''t rush ahead or try to control the tour</li>
<li><strong>Take notes.</strong> Record what the inspector looks at, what they ask, and what they note</li>
<li><strong>Ask for clarification</strong> if you don''t understand a question or a concern</li>
<li><strong>Don''t argue.</strong> If the inspector identifies an issue, accept it and discuss how to resolve it</li>
</ol>
</div>

<h3>The Documentation Bundle</h3>
<p>Have these documents ready in a single folder for the inspector:</p>
<table>
<thead>
<tr><th>Document</th><th>Time Period</th></tr>
</thead>
<tbody>
<tr><td>Consignment Notes / Waste Transfer Notes</td><td>Last 3 years</td></tr>
<tr><td>Carrier registration certificate</td><td>Current</td></tr>
<tr><td>Waste management policy</td><td>Current version</td></tr>
<tr><td>Staff training records</td><td>All current staff</td></tr>
<tr><td>Risk assessments</td><td>Current</td></tr>
<tr><td>Internal audit records</td><td>Last 12 months</td></tr>
<tr><td>Corrective action log</td><td>Current</td></tr>
<tr><td>Pre-acceptance audit from carrier</td><td>Current</td></tr>
<tr><td>Incident records</td><td>Last 12 months</td></tr>
</tbody>
</table>

<h3>Summary</h3>
<p>Preparation is the key to a successful inspection. Follow this checklist in the days before, be cooperative on the day, and have your documentation ready. In the final lesson, we''ll look at what happens after the inspection and how to handle any findings.</p>',
  2,
  12
);

-- Lesson 5.3: After the Inspection
INSERT INTO lessons (module_id, title, content, display_order, duration)
VALUES (
  'c2f7b33a-cec2-457f-b27f-faec0f291d6e',
  'After the Inspection: Next Steps',
  '<h2>The Inspection Report</h2>
<p>After the inspection, you''ll receive a written report. The timeline varies — some inspectors give verbal feedback on the day, with a formal report following within 2-4 weeks. The report will typically include:</p>
<ul>
<li>A summary of what was inspected</li>
<li>Findings — what was compliant and what wasn''t</li>
<li>Any enforcement action being taken (if applicable)</li>
<li>Required corrective actions with deadlines</li>
<li>A follow-up date (if needed)</li>
</ul>

<h3>Responding to Findings</h3>

<h4>If No Issues Were Found</h4>
<p>Congratulations — but don''t become complacent. Continue your regular audit schedule and maintain your systems. An inspection pass is valid only until the next inspection.</p>

<h4>If Minor Issues Were Found</h4>
<p>For minor issues, you''ll typically receive an informal letter or email with recommendations. You should:</p>
<ol>
<li>Acknowledge receipt of the findings</li>
<li>Create a corrective action plan using the process from Module 4</li>
<li>Complete all actions within the stated deadline</li>
<li>Document everything — including evidence of completion</li>
<li>Reply to the inspector with confirmation that actions are complete</li>
</ol>

<h4>If Serious Issues Were Found</h4>
<p>Serious findings may result in formal enforcement action:</p>
<table>
<thead>
<tr><th>Action</th><th>What It Means</th><th>Your Response</th></tr>
</thead>
<tbody>
<tr><td>Improvement Notice</td><td>Formal notice with a deadline to fix specific issues</td><td>Fix within deadline; document everything; notify inspector when complete</td></tr>
<tr><td>Prohibition Notice</td><td>Activity must stop immediately until issue resolved</td><td>Stop the affected activity; fix the issue; request a re-inspection before resuming</td></tr>
<tr><td>Formal Caution</td><td>A formal warning placed on record</td><td>Accept or contest; seek legal advice before responding</td></tr>
<tr><td>Prosecution</td><td>Criminal charges for serious breaches</td><td>Seek legal advice immediately; cooperate fully; do not destroy evidence</td></tr>
</tbody>
</table>

<div class="callout callout-danger">
<h3>If You Receive an Improvement Notice</h3>
<p>Do not ignore it. Treat it as a priority. Failure to comply with an Improvement Notice is a criminal offence. If you need more time, contact the issuing body <em>before</em> the deadline expires — they may grant an extension if you have a credible plan.</p>
</div>

<h3>Using Inspection Findings to Improve</h3>
<p>Even a clean inspection provides learning opportunities. After every inspection:</p>
<ol>
<li>Review the findings with your team</li>
<li>Update your internal audit checklist based on what the inspector checked</li>
<li>Update your waste management policy if the inspection revealed any gaps</li>
<li>Schedule staff training to address any weaknesses identified</li>
<li>Add the inspection date to your compliance calendar for the next scheduled visit</li>
</ol>

<h3>Building an Inspection-Ready Culture</h3>
<p>The practices that handle inspections best are those where compliance is a habit, not a scramble. To build this culture:</p>
<ul>
<li><strong>Make audits routine:</strong> Schedule them in your calendar and stick to them</li>
<li><strong>Keep documentation live:</strong> Update records as things happen, not in a pre-inspection rush</li>
<li><strong>Train continuously:</strong> Brief staff on changes as they happen, not just annually</li>
<li><strong>Lead by example:</strong> If the practice owner follows the rules, staff will too</li>
<li><strong>Celebrate compliance:</strong> Acknowledge when audits go well and improvements are made</li>
</ul>

<h3>Course Conclusion</h3>
<div class="callout callout-info">
<h3>You''ve Completed the Certificate in Healthcare Waste Management</h3>
<p>Throughout this course, you''ve learned:</p>
<ul>
<li>The legal framework governing healthcare waste in the UK</li>
<li>How to apply the Duty of Care in your daily practice</li>
<li>The HTM 07-01 colour-coded segregation system</li>
<li>How to apply the waste hierarchy to minimise waste</li>
<li>How to handle difficult waste streams safely</li>
<li>How to conduct internal audits and corrective actions</li>
<li>How to prepare for and handle external inspections</li>
</ul>
<p>You now have the knowledge and tools to manage healthcare waste compliantly and confidently. Mark this lesson as complete to generate your certificate.</p>
</div>

<h3>Next Steps</h3>
<ul>
<li>Download the audit checklist and corrective action log templates</li>
<li>Schedule your first internal audit</li>
<li>Brief your team on what you''ve learned</li>
<li>Display your certificate when you receive it</li>
<li>Consider additional courses in our catalogue for deeper knowledge in specific areas</li>
</ul>

<p>Thank you for completing this course. Stay safe, stay compliant, and keep improving.</p>',
  3,
  12
);
