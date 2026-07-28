/**
 * DYOGAS Decision Intelligence — browser MVP client.
 * No automatic recommendation / decision.
 */

const state = {
  session: null,
  home: null,
  currentId: null,
  current: null,
  error: "",
  busy: false,
};

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text };
  }
  if (!res.ok) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return body;
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function route() {
  const hash = location.hash.replace(/^#/, "") || "home";
  const [name, id] = hash.split("/");
  return { name, id };
}

function setError(err) {
  state.error = err ? String(err.message || err) : "";
}

async function loadHome() {
  state.home = await api("/decision/home");
  state.session = state.home.session;
}

async function loadDecision(id) {
  state.currentId = id;
  state.current = await api(`/decision/${encodeURIComponent(id)}`);
}

function pipelineHtml(rec) {
  const order = [
    ["request", "Request"],
    ["research", "Research"],
    ["evidence", "Evidence"],
    ["decision_asset", "Decision Asset"],
    ["human_approval", "Human Approval"],
  ];
  const done = new Set(rec.stages_completed || []);
  return `<div class="pipeline" aria-label="Decision pipeline">
    ${order
      .map(([key, label]) => {
        const isDone = done.has(key);
        let hint = isDone ? "Complete" : "Not reached";
        if (key === "research" && rec.research_report_ref) hint = esc(rec.research_report_ref);
        if (key === "evidence") hint = `${rec.evidence_count || 0} evidence item(s)`;
        if (key === "human_approval") {
          hint =
            rec.status === "waiting_human"
              ? "Waiting for human"
              : rec.status === "approved"
                ? "Approved"
                : rec.status === "rejected"
                  ? "Rejected"
                  : hint;
        }
        return `<div class="stage ${isDone ? "done" : ""}"><div class="name">${label}</div><div class="hint">${hint}</div></div>`;
      })
      .join("")}
  </div>`;
}

function renderHome() {
  const s = state.session || {};
  const inbox = state.home?.inbox || [];
  const history = state.home?.history || [];
  return `
  <section class="hero">
    <div class="eyebrow">Decision Intelligence</div>
    <h1>DYOGAS</h1>
    <p>Ask a personal decision question, watch the researched path, and approve the artifact yourself. Nothing auto-decides.</p>
    <div class="actions">
      <a class="button" href="#create">New decision</a>
      <a class="button secondary" href="#memory">Decision Memory</a>
    </div>
  </section>
  <section class="section">
    <div class="meta">
      <span><strong>User</strong> ${esc(s.user_id)}</span>
      <span><strong>Tenant</strong> ${esc(s.tenant_id)}</span>
    </div>
    <h2>Waiting for you</h2>
    <p class="lead">Pending human approvals only — never auto-approved.</p>
    <div class="list">
      ${
        inbox.length
          ? inbox
              .map(
                (i) => `<div class="list-item">
          <a href="#progress/${esc(i.proposalId)}">${esc(i.decisionQuestion)}</a>
          <span class="sub">${esc(i.status)} · ${esc(i.createdAt)}</span>
        </div>`,
              )
              .join("")
          : `<p class="empty">No pending decisions.</p>`
      }
    </div>
  </section>
  <section class="section">
    <h2>Previous decisions</h2>
    <div class="list">
      ${
        history.length
          ? history
              .map(
                (h) => `<div class="list-item">
          <strong>${esc(h.question)}</strong>
          <span class="sub">${esc(h.chosen_option?.statement || h.outcome_status)} · ${esc(h.created_at)}</span>
        </div>`,
              )
              .join("")
          : `<p class="empty">No recorded Decision Models yet.</p>`
      }
    </div>
  </section>`;
}

function renderCreate() {
  if (state.busy) {
    return `
  <section class="section">
    <h2>Researching...</h2>
    <p class="lead">Calling Execution Host → Research Agent → live-stage1-v1. Fail closed on live failure — no fixture fallback.</p>
  </section>`;
  }
  return `
  <section class="section">
    <h2>Create decision</h2>
    <p class="lead">Your question enters the existing Host → Research → Decision Asset path. Approval stays with you.</p>
    <form id="create-form">
      <label>Question
        <textarea name="question" required placeholder="Should I build an AI startup in Tokyo or continue employment?"></textarea>
      </label>
      <label>Constraints (JSON object)
        <textarea name="constraints" placeholder='{"location":"Tokyo","timeframe":"2026"}'>{"location":"Tokyo","timeframe":"2026"}</textarea>
      </label>
      <label>Desired outcome
        <input name="desired_outcome" required placeholder="Maximize long-term entrepreneurial optionality" />
      </label>
      <div class="actions">
        <button type="submit">Start research path</button>
        <a class="button secondary" href="#home">Cancel</a>
      </div>
    </form>
  </section>`;
}

function evidenceListHtml(rec, compact = false) {
  const items = Array.isArray(rec.evidence_items) ? rec.evidence_items : [];
  if (!items.length) {
    return `<p class="empty">No evidence items.</p>`;
  }
  return `<ul class="evidence-list">
    ${items
      .map(
        (e) => `<li>
      <div><strong>Source</strong> <a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(e.title || e.source_url)}</a> <span class="sub">(${esc(e.source_class)})</span></div>
      ${
        e.fact
          ? `<div><strong>Fact</strong> ${esc(e.fact)}</div>
      <div><strong>Implication</strong> ${esc(e.implication || "—")}</div>
      <div><strong>Decision impact</strong> ${esc(e.decision_impact || "—")}</div>`
          : `<div><strong>Claim</strong> ${esc(e.extracted_claim || "(missing claim)")}</div>
      <div><strong>Why relevant</strong> ${esc(e.relevance_reason || "—")}</div>`
      }
      ${compact ? "" : `<div><strong>Confidence</strong> ${esc(e.confidence ?? "—")} · authority ${esc(e.authority_score ?? "—")} · relevance ${esc(e.relevance_score ?? "—")}</div>
      <div class="sub mono">${esc(e.provenance?.pointer || e.source_url)}</div>`}
    </li>`,
      )
      .join("")}
  </ul>`;
}

function decisionAssetApprovalHtml(rec) {
  const asset = rec.decision_asset || {};
  const target = asset.approval_target || {};
  const options = Array.isArray(asset.options) ? asset.options : [];
  const unknowns = Array.isArray(asset.unknowns) ? asset.unknowns : [];
  const evidenceItems = Array.isArray(asset.evidence_items) ? asset.evidence_items : [];
  const confidence = asset.confidence_level || "HIGH";
  return `
    <div class="panel decision-asset-approval">
      <h3>What are you approving?</h3>
      <p class="lead"><strong>${esc(
        target.approval_question ||
          (target.knowledge_title
            ? `You are approving creation of: ${target.knowledge_title} Knowledge`
            : asset.title || "Decision Knowledge"),
      )}</strong></p>
      <h4>Context</h4>
      <p>${esc(asset.decision_context || asset.summary || "")}</p>
      ${
        target.knowledge_preview
          ? `<p class="sub">${esc(target.knowledge_preview)}</p>`
          : ""
      }
      ${
        confidence === "MEDIUM"
          ? `<div class="panel warn" role="status"><p>Evidence confidence is <strong>MEDIUM</strong> — review unknowns before approving.</p></div>`
          : ""
      }
      <h4>Choices</h4>
      <fieldset class="option-radios" id="approval-options">
        ${options
          .map(
            (o, idx) => `<label class="option-radio">
          <input type="radio" name="approval_option" value="${esc(o.option_id)}" ${
              idx === 0 ? "checked" : ""
            } ${state.busy || rec.status !== "waiting_human" ? "disabled" : ""} />
          <span><strong>Option ${String.fromCharCode(65 + idx)}:</strong> ${esc(o.title || o.description || "")}</span>
          ${
            (o.benefits || o.advantages || []).length
              ? `<ul>${(o.benefits || o.advantages)
                  .slice(0, 3)
                  .map((b) => `<li>${esc(b)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </label>`,
          )
          .join("")}
        <label class="option-radio">
          <input type="radio" name="approval_option" value="__request_more_evidence__" ${
            state.busy || rec.status !== "waiting_human" ? "disabled" : ""
          } />
          <span><strong>Option ${String.fromCharCode(65 + options.length)}:</strong> Request more evidence</span>
        </label>
        <label class="option-radio">
          <input type="radio" name="approval_option" value="__reject__" ${
            state.busy || rec.status !== "waiting_human" ? "disabled" : ""
          } />
          <span><strong>Option ${String.fromCharCode(65 + options.length + 1)}:</strong> Reject</span>
        </label>
      </fieldset>
      ${
        unknowns.length
          ? `<h4>Unknowns</h4><ul>${unknowns
              .slice(0, 5)
              .map((u) => `<li>${esc(u)}</li>`)
              .join("")}</ul>`
          : ""
      }
      <details class="audit-details">
        <summary>Audit Evidence</summary>
        <p class="sub">Technical evidence detail — collapsed by default.</p>
        <ol>
          ${evidenceItems
            .map(
              (e) => `<li>
            <p><strong>${esc(e.source || "Source")}</strong></p>
            <p><strong>Fact:</strong> ${esc(e.fact || "")}</p>
            <p><strong>Relevance:</strong> ${esc(e.relevance || "")}</p>
            <p><strong>Impact:</strong> ${esc(e.decision_impact || "")}</p>
            ${
              e.provenance?.pointer
                ? `<p class="mono sub">${esc(e.provenance.pointer)}</p>`
                : ""
            }
          </li>`,
            )
            .join("")}
        </ol>
        ${evidenceListHtml(rec)}
      </details>
      <p class="lead">No automatic recommendation — you choose which knowledge to create.</p>
    </div>`;
}

function decisionBriefHtml(rec) {
  const asset = rec.decision_asset;
  if (asset?.approval_target) return decisionAssetApprovalHtml(rec);
  const b = rec.decision_brief;
  if (!b) return researchSummaryHtml(rec);
  const factors = Array.isArray(b.research_factors)
    ? b.research_factors
    : Array.isArray(b.decision_factors)
      ? b.decision_factors
      : [];
  const keyFactors = Array.isArray(b.key_factors) ? b.key_factors : [];
  const sources = Array.isArray(b.evidence_sources)
    ? b.evidence_sources
    : Array.isArray(b.evidence_summary)
      ? b.evidence_summary
      : Array.isArray(b.strongest_evidence)
        ? b.strongest_evidence
        : [];
  const evidence = Array.isArray(b.evidence_summary)
    ? b.evidence_summary
    : Array.isArray(b.strongest_evidence)
      ? b.strongest_evidence
      : [];
  const options = Array.isArray(b.decision_options) ? b.decision_options : [];
  const unknowns = Array.isArray(b.unknowns) ? b.unknowns : [];
  const missing = Array.isArray(b.missing_information)
    ? b.missing_information
    : Array.isArray(b.evidence_gaps)
      ? b.evidence_gaps
      : [];
  const findings = Array.isArray(b.key_findings) ? b.key_findings : [];
  const confidence = b.confidence_level || b.evidence_quality_status || "HIGH";
  return `
    <div class="panel decision-brief">
      <h3>Decision Brief</h3>
      <p class="lead">${esc(b.context || "")}</p>
      <h4>Question</h4>
      <p>${esc(b.question)}</p>
      <p class="lead">Domain: <strong>${esc(b.domain || b.decision_domain)}</strong>${
        b.user_goal ? ` · goal: <strong>${esc(b.user_goal)}</strong>` : ""
      } · Confidence: <strong>${esc(confidence)}</strong> · <strong>WAITING_HUMAN</strong></p>
      ${
        b.confidence_warning
          ? `<div class="panel warn" role="status"><h4>Evidence confidence warning</h4><p>${esc(
              b.confidence_warning,
            )}</p></div>`
          : ""
      }
      <h4>Research factors</h4>
      <ul>${
        factors.length
          ? factors.map((f) => `<li>${esc(typeof f === "string" ? f : f.factor)}</li>`).join("")
          : keyFactors.map((f) => `<li>${esc(f.factor)}</li>`).join("")
      }</ul>
      <h4>Evidence sources</h4>
      <ul>
        ${sources
          .map(
            (e) =>
              `<li><a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(
                e.title,
              )}</a>${e.source_class ? ` <span class="sub">(${esc(e.source_class)})</span>` : ""}</li>`,
          )
          .join("")}
      </ul>
      <h4>Missing information</h4>
      ${
        missing.length
          ? `<ul>${missing.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>`
          : `<p class="empty">None flagged</p>`
      }
      ${
        findings.length
          ? `<h4>Key findings</h4><ul>${findings.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
          : ""
      }
      <details class="audit-details">
        <summary>Audit detail (raw evidence — collapsed by default)</summary>
        <ol>
          ${evidence
            .map(
              (e) => `<li>
            <p><a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(e.title)}</a></p>
            <p><strong>Fact:</strong> ${esc(e.fact || "")}</p>
            <p><strong>Why relevant:</strong> ${esc(e.why_relevant || e.implication || "—")}</p>
            <p><strong>Decision impact:</strong> ${esc(e.decision_impact || "")}</p>
          </li>`,
            )
            .join("")}
        </ol>
      </details>
      <h4>Tradeoffs / options</h4>
      ${options
        .map(
          (o, idx) => `<div class="option-block" data-option-id="${esc(o.option_id)}">
        <h5>Option ${String.fromCharCode(65 + idx)}: ${esc(o.title)}</h5>
        <p><em>Why consider:</em> ${esc(o.why_consider)}</p>
        <p><strong>Benefits</strong></p>
        <ul>${(o.advantages || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        <p><strong>Risks</strong></p>
        <ul>${(o.risks || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
      </div>`,
        )
        .join("")}
      ${
        unknowns.length
          ? `<h4>Unknowns</h4><ul>${unknowns.map((u) => `<li>${esc(u)}</li>`).join("")}</ul>`
          : ""
      }
      <h4>What you are approving</h4>
      <div class="panel warn" role="status">
        <p><strong>${esc(
          b.approval_question ||
            (b.proposed_knowledge_artifact
              ? `You are approving creation of: ${b.proposed_knowledge_artifact} Knowledge`
              : "You are approving creation of Decision Knowledge"),
        )}</strong></p>
        <p class="sub">${esc(b.knowledge_preview || "")}</p>
        <p class="sub">This is not "Approve research" — you are authorizing Knowledge / Decision Model creation.</p>
      </div>
      <p class="lead">No automatic recommendation — you choose which option to record.</p>
    </div>`;
}

function researchSummaryHtml(rec) {
  const s = rec.research_summary;
  if (!s) return "";
  const list = (arr) =>
    Array.isArray(arr) && arr.length
      ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
      : `<p class="empty">None yet</p>`;
  return `
    <div class="panel">
      <h3>Research Summary</h3>
      <p class="lead">Status: <strong>${esc(s.status || "WAITING_HUMAN")}</strong> · automatic recommendation: never</p>
      ${
        Array.isArray(s.research_intents) && s.research_intents.length
          ? `<h4>Research intents</h4><ul>${s.research_intents.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
          : ""
      }
      <h4>Key findings</h4>
      ${list(s.key_findings)}
      <h4>Market signals</h4>
      ${list(s.market_signals)}
      <h4>Risks</h4>
      ${list(s.risks)}
      <h4>Decision options</h4>
      ${list(s.decision_options_preview)}
    </div>`;
}

function decisionOptionsHtml(rec) {
  const asset = rec.decision_asset || {};
  const options = Array.isArray(asset.options) ? asset.options : [];
  if (!options.length) return "";
  return `
    <div class="panel">
      <h3>Decision options (you choose)</h3>
      <p class="lead">No automatic ranking — review options before approval.</p>
      ${options
        .map(
          (o) => `<div class="option-block">
        <h4>${esc(o.title)}</h4>
        <p><strong>Advantages</strong></p>
        <ul>${(o.advantages || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        <p><strong>Risks</strong></p>
        <ul>${(o.risks || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        <p><strong>Unknowns</strong></p>
        <ul>${(o.unknowns || []).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        <p class="sub mono">evidence: ${(o.supporting_evidence || []).join(", ")}</p>
      </div>`,
        )
        .join("")}
    </div>`;
}

function renderProgress(rec) {
  if (!rec) return `<p class="empty">Decision not loaded.</p>`;
  const waiting = rec.status === "waiting_human";
  return `
  <section class="section">
    <span class="badge ${waiting ? "warn" : ""}">${esc(rec.status)}</span>
    <h2>${esc(rec.question)}</h2>
    <p class="lead">Live pipeline from execution state — no simulated progress.</p>
    <div class="meta">
      <span>Host: ${esc(rec.host_status)}</span>
      <span>Evidence: ${esc(rec.evidence_count)}</span>
      <span>Collector: ${esc(rec.collector_adapter_id || "—")}</span>
      <span>Research ms: ${esc(rec.research_elapsed_ms ?? "—")}</span>
      <span>Auto-approve: never</span>
    </div>
    ${
      rec.artifact_dir
        ? `<p class="mono">Artifacts: ${esc(rec.artifact_dir)}</p>`
        : `<p class="error">Missing artifact_dir — product E2E incomplete</p>`
    }
    ${pipelineHtml(rec)}
    ${decisionAssetApprovalHtml(rec)}
    ${
      waiting
        ? `<p class="lead"><strong>WAITING_HUMAN</strong> — approve or reject; DYOGAS will not decide for you.</p>`
        : ""
    }
    <div class="actions">
      ${
        waiting
          ? `<a class="button" href="#approve/${esc(rec.proposalId)}">Open approval</a>`
          : rec.status === "approved"
            ? `<a class="button" href="#result/${esc(rec.proposalId)}">View result</a>`
            : ""
      }
      <a class="button secondary" href="#home">Home</a>
    </div>
  </section>`;
}

function renderApprove(rec) {
  if (!rec) return `<p class="empty">Decision not loaded.</p>`;
  return `
  <section class="section">
    <h2>Human approval</h2>
    <p class="lead">Choose what knowledge to create. DYOGAS will not decide for you.</p>
    ${decisionAssetApprovalHtml(rec)}
    <div class="actions">
      <button id="btn-approve-selected" class="button" ${
        state.busy || rec.status !== "waiting_human" ? "disabled" : ""
      }>Approve Selected</button>
      <button id="btn-more-evidence" class="secondary" ${
        state.busy || rec.status !== "waiting_human" ? "disabled" : ""
      }>Request More Evidence</button>
      <button id="btn-reject" class="danger" ${
        state.busy || rec.status !== "waiting_human" ? "disabled" : ""
      }>Reject</button>
      <a class="button secondary" href="#progress/${esc(rec.proposalId)}">Back</a>
    </div>
  </section>`;
}

function renderResult(rec) {
  if (!rec) return `<p class="empty">Decision not loaded.</p>`;
  const model = rec.decisionModel || {};
  const dna = rec.dna || {};
  const patterns = rec.analysis?.patterns || {};
  const similar = patterns.similar_past_decisions || [];
  return `
  <section class="section">
    <span class="badge">${esc(rec.status)}</span>
    <h2>Decision result</h2>
    <p class="lead">Decision Model + DNA signals + similar past decisions. No automatic recommendation.</p>
    <div class="panel">
      <h3>Decision Model</h3>
      <p><strong>Question:</strong> ${esc(model.question || rec.question)}</p>
      <p><strong>Chosen option:</strong> ${esc(model.chosen_option?.statement || "—")}</p>
      <p><strong>Rationale:</strong> ${esc(model.rationale || rec.rationale || "—")}</p>
      <p class="mono">approval_ref=${esc(model.approval_ref || "")}</p>
    </div>
    <div class="panel">
      <h3>Decision DNA signals</h3>
      <ul>
        ${(dna.risk_profile?.signals || [])
          .map((s) => `<li>${esc(s)}</li>`)
          .join("") || "<li class='empty'>No DNA signals</li>"}
      </ul>
    </div>
    <div class="panel">
      <h3>Similar past decisions</h3>
      <ul>
        ${
          similar.length
            ? similar
                .map((s) => `<li>${esc(s.question)} <span class="sub">${esc((s.evidence_refs || []).join(", "))}</span></li>`)
                .join("")
            : "<li class='empty'>None in user memory yet</li>"
        }
      </ul>
      <p class="mono">human_approval_required=${esc(String(patterns.human_approval_required ?? true))} · recommendation=${esc(String(patterns.recommendation ?? false))} · automatic_decision=${esc(String(patterns.automatic_decision ?? false))}</p>
    </div>
    <div class="panel">
      <h3>Evidence references</h3>
      <p class="mono">${esc((model.evidence_refs || rec.evidence_ids || []).join("\n"))}</p>
    </div>
    <div class="actions">
      <a class="button" href="#memory">Decision Memory</a>
      <a class="button secondary" href="#home">Home</a>
    </div>
  </section>`;
}

function renderMemory() {
  const history = state.home?.history || [];
  return `
  <section class="section">
    <h2>Decision Memory</h2>
    <p class="lead">Recorded Decision Models for this user — question, choice, rationale, timestamp.</p>
    <div class="list">
      ${
        history.length
          ? history
              .map(
                (h) => `<div class="list-item">
        <strong>${esc(h.question)}</strong>
        <span class="sub">${esc(h.chosen_option?.statement || "")}</span>
        <span class="sub">${esc(h.rationale || "")}</span>
        <span class="sub">${esc(h.created_at)}</span>
      </div>`,
              )
              .join("")
          : `<p class="empty">Memory is empty for this user.</p>`
      }
    </div>
  </section>`;
}

function showInitFailure(err) {
  console.error("[DYOGAS UI] initialization failed", err);
  const root = document.getElementById("app");
  const message = err instanceof Error ? err.message : String(err ?? "Unknown error");
  const html = `<section class="section"><h2>DYOGAS UI initialization failed</h2><p class="error">${esc(message)}</p><a class="button secondary" href="#home">Retry home</a></section>`;
  if (root) root.innerHTML = html;
}

async function render() {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("#app mount point not found");
  }
  const { name, id } = route();
  let body = "";
  try {
    if (!state.home || name === "home" || name === "memory") {
      await loadHome();
    }
    if ((name === "progress" || name === "approve" || name === "result") && id) {
      await loadDecision(id);
    }
    if (name === "create") body = renderCreate();
    else if (name === "progress") body = renderProgress(state.current);
    else if (name === "approve") body = renderApprove(state.current);
    else if (name === "result") body = renderResult(state.current);
    else if (name === "memory") body = renderMemory();
    else body = renderHome();
  } catch (err) {
    setError(err);
    body = `<p class="error">${esc(state.error)}</p><a class="button secondary" href="#home">Home</a>`;
  }
  root.innerHTML =
    (state.error && name !== "home" ? `<p class="error">${esc(state.error)}</p>` : "") +
    body;
  bind(name);
}

function bind(name) {
  if (name === "create") {
    const form = document.getElementById("create-form");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      let constraints = {};
      try {
        constraints = JSON.parse(String(fd.get("constraints") || "{}"));
      } catch {
        setError(new Error("Constraints must be valid JSON"));
        await render();
        return;
      }
      const question = String(fd.get("question") || "");
      const desired_outcome = String(fd.get("desired_outcome") || "");
      state.busy = true;
      setError("");
      await render();
      try {
        const created = await api("/decision/request", {
          method: "POST",
          body: JSON.stringify({
            question,
            constraints,
            desired_outcome,
          }),
        });
        state.busy = false;
        location.hash = `#progress/${created.proposalId}`;
      } catch (err) {
        setError(err);
        state.busy = false;
        await render();
      }
    });
  }
  if (name === "approve") {
    document.getElementById("btn-approve-selected")?.addEventListener("click", async () => {
      const selected = document.querySelector(
        'input[name="approval_option"]:checked',
      );
      const value = selected?.value || "";
      if (value === "__request_more_evidence__") {
        document.getElementById("btn-more-evidence")?.click();
        return;
      }
      if (value === "__reject__") {
        document.getElementById("btn-reject")?.click();
        return;
      }
      if (!value) {
        setError(new Error("Select an option before approving"));
        await render();
        return;
      }
      state.busy = true;
      setError("");
      try {
        const updated = await api(
          `/decision/${encodeURIComponent(state.currentId)}/approve`,
          {
            method: "POST",
            body: JSON.stringify({
              action: "approve_option",
              chosen_option_id: value,
              rationale: `Approved option ${value} in browser MVP`,
            }),
          },
        );
        state.current = updated;
        location.hash = `#result/${updated.proposalId}`;
      } catch (err) {
        setError(err);
      } finally {
        state.busy = false;
        await render();
      }
    });
    document.querySelectorAll(".btn-approve-option").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const optionId = btn.getAttribute("data-option-id");
        state.busy = true;
        setError("");
        try {
          const updated = await api(
            `/decision/${encodeURIComponent(state.currentId)}/approve`,
            {
              method: "POST",
              body: JSON.stringify({
                action: "approve_option",
                chosen_option_id: optionId,
                rationale: `Approved option ${optionId} in browser MVP`,
              }),
            },
          );
          state.current = updated;
          location.hash = `#result/${updated.proposalId}`;
        } catch (err) {
          setError(err);
        } finally {
          state.busy = false;
          await render();
        }
      });
    });
    document.getElementById("btn-more-evidence")?.addEventListener("click", async () => {
      state.busy = true;
      setError("");
      try {
        const updated = await api(
          `/decision/${encodeURIComponent(state.currentId)}/approve`,
          {
            method: "POST",
            body: JSON.stringify({
              action: "request_more_evidence",
              rationale: "Request more evidence before approval",
            }),
          },
        );
        state.current = updated;
      } catch (err) {
        setError(err);
      } finally {
        state.busy = false;
        await render();
      }
    });
    document.getElementById("btn-reject")?.addEventListener("click", async () => {
      state.busy = true;
      setError("");
      try {
        const updated = await api(
          `/decision/${encodeURIComponent(state.currentId)}/reject`,
          {
            method: "POST",
            body: JSON.stringify({ rationale: "Rejected in browser MVP" }),
          },
        );
        state.current = updated;
        location.hash = `#progress/${updated.proposalId}`;
      } catch (err) {
        setError(err);
      } finally {
        state.busy = false;
        await render();
      }
    });
  }
}

async function bootstrap() {
  if (!location.hash || location.hash === "#") {
    location.hash = "#home";
  }
  await render();
}

window.addEventListener("error", (event) => {
  console.error("[DYOGAS UI] uncaught error", event.error || event.message);
  const root = document.getElementById("app");
  if (root && !root.innerHTML.trim()) {
    showInitFailure(event.error || event.message);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[DYOGAS UI] unhandled rejection", event.reason);
  const root = document.getElementById("app");
  if (root && !root.innerHTML.trim()) {
    showInitFailure(event.reason);
  }
});

window.addEventListener("hashchange", () => {
  setError("");
  render().catch(showInitFailure);
});

function startApp() {
  bootstrap().catch(showInitFailure);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
