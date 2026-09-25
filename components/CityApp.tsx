"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Compass,
  ExternalLink,
  Eye,
  EyeOff,
  Home,
  Layers3,
  Maximize2,
  Pause,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Category, Company, companies, districts, SNAPSHOT } from "@/lib/data";
import { dateAt, disclosedFunding, money, recordAt, stateAt } from "@/lib/city";
import type { CameraRequest } from "./CityScene";

const CityScene = dynamic(() => import("./CityScene"), {
  ssr: false,
  loading: () => (
    <div className="world-loading">
      <span className="loading-cube" />
      Assembling the skyline…
    </div>
  ),
});
const categories = Object.keys(districts) as Category[];
const latestYear = 2026 + 8 / 12;
const formatDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const timelineYear = (date: string) =>
  Number(date.slice(0, 4)) + (Number(date.slice(5, 7)) - 1) / 12;
const number = (value: number | null) =>
  value === null ? "Not provided" : value.toLocaleString();

export default function CityApp() {
  const [entered, setEntered] = useState(false),
    [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(null),
    [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [searchIndex, setSearchIndex] = useState(0);
  const [year, setYear] = useState(latestYear),
    [playing, setPlaying] = useState(false);
  const [view, setView] = useState<
    "explore" | "rankings" | "compare" | "timeline"
  >("explore");
  const [comparison, setComparison] = useState<string[]>([]),
    [comparing, setComparing] = useState(false);
  const [labels, setLabels] = useState(true),
    [help, setHelp] = useState(false),
    [methodology, setMethodology] = useState(false);
  const [panelTab, setPanelTab] = useState<"overview" | "history" | "sources">(
    "overview",
  );
  const [request, setRequest] = useState<CameraRequest>({ id: 0, home: true });
  const searchRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const date = dateAt(year);
  const company = companies.find((c) => c.id === selected);
  const results = useMemo(
    () =>
      companies.filter((c) =>
        `${c.name} ${c.category} ${c.id === "cursor" ? "Anysphere" : ""}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
      ),
    [query],
  );
  const ranks = useMemo(
    () =>
      [...companies].sort(
        (a, b) =>
          (recordAt(b, date)?.amount ?? 0) - (recordAt(a, date)?.amount ?? 0),
      ),
    [date],
  );
  const total = companies.reduce(
    (sum, c) => sum + (recordAt(c, date)?.amount ?? 0),
    0,
  );
  const valuedCount = companies.filter((c) => recordAt(c, date)).length;
  const onReady = useCallback(() => setReady(true), []);
  const select = useCallback((id: string) => {
    setSelected(id);
    setPanelTab("overview");
    setSearchOpen(false);
    setQuery("");
    setRequest((r) => ({ id: r.id + 1, company: id }));
  }, []);
  const enter = useCallback(() => setEntered(true), []);
  const home = () => {
    setComparing(false);
    setView("explore");
    setSelected(null);
    setRequest((r) => ({ id: r.id + 1, home: true }));
  };
  const toggleCompare = (id: string) =>
    setComparison((ids) =>
      ids.includes(id)
        ? ids.filter((x) => x !== id)
        : ids.length < 4
          ? [...ids, id]
          : ids,
    );
  const navigate = (next: typeof view) => {
    setView(next);
    setSelected(null);
    setSearchOpen(false);
    if (next !== "compare") setComparing(false);
    if (next === "timeline") document.getElementById("time-range")?.focus();
  };
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setYear((current) => Math.min(latestYear, current + 1 / 12)),
      reducedMotion ? 400 : 180,
    );
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);
  useEffect(() => {
    if (year >= latestYear) setPlaying(false);
  }, [year]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setSearchOpen(false);
        setHelp(false);
        setMethodology(false);
      }
      if (event.key === "Enter" && !entered) enter();
      if (event.key === "/" && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [entered, enter]);
  const highlighted =
    searchOpen && query
      ? (results[Math.min(searchIndex, results.length - 1)]?.id ?? null)
      : hovered;
  const hoverCompany = companies.find((c) => c.id === highlighted);
  return (
    <main
      className={`city-app ${entered ? "is-entered" : "is-opening"} ${comparing ? "is-comparing" : ""}`}
    >
      <div
        className="city-canvas"
        aria-label="Interactive 3D city. Drag to rotate, right drag to pan, scroll to zoom."
      >
        <CityScene
          entered={entered}
          date={date}
          selected={selected}
          highlighted={highlighted}
          comparison={comparison}
          comparing={comparing}
          labels={labels && entered}
          reducedMotion={reducedMotion}
          request={request}
          onSelect={select}
          onHover={setHovered}
          onReady={onReady}
        />
      </div>
      <div className="vignette" />
      <header className="topbar">
        <button className="brand" onClick={home} aria-label="AI City home">
          <span className="brand-icon">
            <i />
            <i />
            <i />
          </span>
          <span>
            AI CITY<small>THE PRIVATE AI ECONOMY</small>
          </span>
        </button>
        {entered && (
          <nav aria-label="Main navigation">
            {(["explore", "rankings", "compare", "timeline"] as const).map(
              (item) => (
                <button
                  className={view === item ? "active" : ""}
                  key={item}
                  onClick={() => navigate(item)}
                >
                  {item}
                  {item === "compare" && comparison.length > 0 && (
                    <span className="count">{comparison.length}</span>
                  )}
                </button>
              ),
            )}
          </nav>
        )}
        <div className="edition">
          <span className="live-dot" />
          INTERACTIVE ATLAS <span className="edition-no">/ 001</span>
        </div>
      </header>

      <AnimatePresence>
        {!entered && (
          <motion.section
            className="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: reducedMotion ? 0 : 0.7 }}
          >
            <div className="eyebrow">
              <span />
              WELCOME TO AI VALUATION CITY
            </div>
            <h1>
              A new economy.
              <br />A whole new <em>skyline.</em>
            </h1>
            <p>
              The world’s private AI companies, built to scale.
              <br />
              Every tower tells a story. Every floor is a bigger bet.
            </p>
            <div className="opening-stat">
              <strong>
                {money(total)}
                <span>†</span>
              </strong>
              <div>
                IN TRACKED VALUATIONS
                <small>20 companies. One extraordinary city.</small>
              </div>
            </div>
            <button className="enter-button" onClick={enter}>
              ENTER CITY <ArrowRight size={18} />
            </button>
            <span className="enter-hint">
              {ready ? "OR PRESS ENTER TO EXPLORE" : "ASSEMBLING YOUR CITY…"}
            </span>
            <div className="opening-footnote">
              † Sum of latest recorded values, across different dates and
              transaction types.
              <br />
              Curated data through September 2025. Not a live market estimate.
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      {!entered && (
        <div className="opening-coordinate">
          37°46′ N &nbsp; 122°25′ W{" "}
          <span>AN IMAGINARY CITY. A REAL ECONOMY.</span>
        </div>
      )}

      {entered && (
        <>
          <section className="explore-heading">
            <div className="eyebrow">
              <span />
              {comparing ? "SIDE BY SIDE" : "THE SKYLINE OF INTELLIGENCE"}
            </div>
            <h1>
              {comparing
                ? "A matter of scale."
                : "Big ideas. Bigger buildings."}
            </h1>
            <p>
              {comparing
                ? "Same scale. Different ambitions."
                : "Explore the companies building what comes next."}
            </p>
          </section>
          <div className="search-wrap">
            <div className="search-box">
              <Search size={16} />
              <input
                ref={searchRef}
                aria-label="Find a company"
                placeholder="Find a company…"
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchIndex(0);
                  setSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSearchIndex((i) => Math.min(i + 1, results.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSearchIndex((i) => Math.max(0, i - 1));
                  }
                  if (e.key === "Enter" && results[searchIndex]) {
                    if (comparing) setComparing(false);
                    select(results[searchIndex].id);
                  }
                }}
              />
              <kbd>/</kbd>
              {searchOpen && (
                <button
                  aria-label="Close search"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {searchOpen && (
              <div className="search-results">
                <div className="menu-eyebrow">
                  {query ? `${results.length} MATCHES` : "FLY TO A COMPANY"}
                </div>
                {results.slice(0, 20).map((c, i) => (
                  <button
                    key={c.id}
                    className={i === searchIndex ? "focused" : ""}
                    onMouseEnter={() => setSearchIndex(i)}
                    onClick={() => {
                      if (comparing) setComparing(false);
                      select(c.id);
                    }}
                  >
                    <span
                      className="color-dot"
                      style={{ background: districts[c.category].color }}
                    />
                    <span>
                      {c.name}
                      <small>
                        {c.category} · founded {c.founded}
                      </small>
                    </span>
                    <strong>
                      {recordAt(c, date)
                        ? money(recordAt(c, date)!.amount)
                        : "Unrecorded"}
                    </strong>
                    <ArrowRight size={14} />
                  </button>
                ))}
                {!results.length && (
                  <p>No company found. Try “Cursor” or “Models”.</p>
                )}
              </div>
            )}
          </div>
          {!company && view === "explore" && (
            <aside className="district-menu">
              <div className="menu-eyebrow">NEIGHBORHOODS</div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setRequest((r) => ({ id: r.id + 1, district: category }))
                  }
                >
                  <span
                    className="color-dot"
                    style={{ background: districts[category].color }}
                  />
                  {districts[category].label.replace(" DISTRICT", "")}
                  <ChevronRight size={12} />
                </button>
              ))}
              <div className="scale-note">
                <Layers3 size={13} />
                <span>
                  Building size = valuation
                  <br />
                  <small>Power scale · USD</small>
                </span>
              </div>
            </aside>
          )}
          {hoverCompany && !company && !searchOpen && (
            <div className="hover-card">
              <span
                className="color-dot"
                style={{ background: districts[hoverCompany.category].color }}
              />
              <strong>{hoverCompany.name}</strong>
              <span>
                {recordAt(hoverCompany, date)
                  ? money(recordAt(hoverCompany, date)!.amount)
                  : "No recorded valuation"}
              </span>
              <small>
                {recordAt(hoverCompany, date)?.type ??
                  "Founded; valuation history unavailable"}{" "}
                · Click to explore
              </small>
            </div>
          )}

          <AnimatePresence>
            {company && !comparing && (
              <motion.aside
                className="info-panel panel"
                key={company.id}
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 24, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.22 }}
              >
                <div className="panel-top">
                  <span
                    className="eyebrow"
                    style={{ color: districts[company.category].color }}
                  >
                    {company.category.toUpperCase()} DISTRICT
                  </span>
                  <button
                    className="icon-button"
                    aria-label="Close company details"
                    onClick={() => setSelected(null)}
                  >
                    <X size={17} />
                  </button>
                </div>
                <h2>{company.name}</h2>
                <p className="company-description">{company.description}</p>
                <div className="valuation-hero">
                  {recordAt(company, date)
                    ? money(recordAt(company, date)!.amount)
                    : "—"}
                  <span>USD</span>
                </div>
                <div className="status-tag">
                  {recordAt(company, date)?.type ??
                    (stateAt(company, date) === "absent"
                      ? "Not yet founded"
                      : "No valuation recorded")}
                </div>
                <p className="record-date">
                  {recordAt(company, date)
                    ? `Latest recorded · ${formatDate(recordAt(company, date)!.date)}`
                    : `As of ${formatDate(date)}`}
                </p>
                <div className="panel-tabs">
                  {(["overview", "history", "sources"] as const).map((tab) => (
                    <button
                      key={tab}
                      className={panelTab === tab ? "active" : ""}
                      onClick={() => setPanelTab(tab)}
                    >
                      {tab === "history" ? "Valuation history" : tab}
                    </button>
                  ))}
                </div>
                <div className="panel-content">
                  {panelTab === "overview" && (
                    <CompanyFacts company={company} date={date} />
                  )}
                  {panelTab === "history" && (
                    <div className="history-list">
                      <p className="muted">
                        Select a recorded event to rewind the city.
                      </p>
                      {[...company.history]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((v) => (
                          <button
                            key={`${v.date}-${v.type}`}
                            onClick={() => {
                              setYear(timelineYear(v.date));
                              setPlaying(false);
                            }}
                            className={v.date > date ? "future-event" : ""}
                          >
                            <span className="history-dot" />
                            <span>
                              <small>
                                {formatDate(v.date)}
                                {v.date > date ? " · later event" : ""}
                              </small>
                              <strong>{money(v.amount)}</strong>
                              <span>{v.round}</span>
                              <small>{v.type}</small>
                            </span>
                            <ArrowDown size={15} />
                          </button>
                        ))}
                    </div>
                  )}
                  {panelTab === "sources" && (
                    <div className="source-list">
                      <p className="muted">
                        Original source links supplied with this dataset. Event
                        labels are preserved; a tender or acquisition value is
                        not a funding round.
                      </p>
                      {company.history.map((v) => (
                        <a
                          key={`${v.date}-${v.type}`}
                          href={v.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>
                            {v.source}
                            <small>
                              {formatDate(v.date)} · {money(v.amount)}
                              <br />
                              {v.type}
                            </small>
                          </span>
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className={`compare-company ${comparison.includes(company.id) ? "added" : ""}`}
                  disabled={
                    !comparison.includes(company.id) && comparison.length >= 4
                  }
                  onClick={() => toggleCompare(company.id)}
                >
                  {comparison.includes(company.id) ? (
                    <Check size={15} />
                  ) : (
                    <Plus size={15} />
                  )}
                  {comparison.includes(company.id)
                    ? "Added to comparison"
                    : comparison.length >= 4
                      ? "Comparison full (4 max)"
                      : "Add to comparison"}
                  <span>{comparison.length}/4</span>
                </button>
                {comparison.length >= 2 && (
                  <button
                    className="text-link"
                    onClick={() => {
                      setSelected(null);
                      setView("compare");
                    }}
                  >
                    Open comparison <ArrowRight size={14} />
                  </button>
                )}
              </motion.aside>
            )}
          </AnimatePresence>

          {view === "rankings" && !company && (
            <aside className="ranking-panel panel">
              <div className="panel-top">
                <span className="eyebrow">THE CITY DIRECTORY</span>
                <button
                  className="icon-button"
                  aria-label="Close rankings"
                  onClick={() => setView("explore")}
                >
                  <X size={16} />
                </button>
              </div>
              <h2>The skyline, ranked.</h2>
              <p className="muted">
                Recorded values as of {formatDate(date)}. Select a company to
                fly to its headquarters.
              </p>
              <div className="ranking-list">
                {ranks.map((c, i) => (
                  <button key={c.id} onClick={() => select(c.id)}>
                    <span className="rank-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="color-dot"
                      style={{ background: districts[c.category].color }}
                    />
                    <span>
                      {c.name}
                      <small>
                        {recordAt(c, date)?.type ??
                          (stateAt(c, date) === "absent"
                            ? "Not yet founded"
                            : "No record")}
                      </small>
                    </span>
                    <strong>
                      {recordAt(c, date)
                        ? money(recordAt(c, date)!.amount)
                        : "—"}
                    </strong>
                  </button>
                ))}
              </div>
            </aside>
          )}

          {view === "compare" && !comparing && !company && (
            <aside className="compare-picker panel">
              <div className="panel-top">
                <span className="eyebrow">CHANGE YOUR PERSPECTIVE</span>
                <button
                  className="icon-button"
                  aria-label="Close comparison"
                  onClick={() => setView("explore")}
                >
                  <X size={16} />
                </button>
              </div>
              <h2>Put them in perspective.</h2>
              <p className="muted">
                Choose 2–4 companies. Their buildings move onto a shared
                platform, at the same valuation scale.
              </p>
              <div className="compare-options">
                {companies.map((c) => (
                  <button
                    className={comparison.includes(c.id) ? "chosen" : ""}
                    key={c.id}
                    disabled={
                      !comparison.includes(c.id) && comparison.length === 4
                    }
                    onClick={() => toggleCompare(c.id)}
                  >
                    <span className="check-box">
                      {comparison.includes(c.id) && <Check size={12} />}
                    </span>
                    <span>{c.name}</span>
                    <small>
                      {recordAt(c, date)
                        ? money(recordAt(c, date)!.amount)
                        : "—"}
                    </small>
                  </button>
                ))}
              </div>
              <button
                className="primary-button"
                disabled={comparison.length < 2}
                onClick={() => {
                  setComparing(true);
                  setSelected(null);
                }}
              >
                {comparison.length < 2
                  ? "CHOOSE AT LEAST 2 COMPANIES"
                  : `COMPARE ${comparison.length} BUILDINGS`}
                <ArrowRight size={16} />
              </button>
            </aside>
          )}

          {comparing && (
            <section className="comparison-sheet">
              <div className="comparison-top">
                <span className="eyebrow">
                  VALUATION IN PERSPECTIVE{" "}
                  <span className="muted">/ {formatDate(date)}</span>
                </span>
                <button onClick={home}>
                  RETURN TO CITY <ArrowRight size={14} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Edit comparison"
                  onClick={() => setComparing(false)}
                >
                  <SlidersHorizontal size={15} />
                </button>
              </div>
              <div className="comparison-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>RECORDED METRICS</th>
                      {comparison.map((id) => (
                        <th key={id}>
                          {companies.find((c) => c.id === id)!.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "Valuation",
                      "Transaction type",
                      "Funding in dataset¹",
                      "Valuation / funding¹",
                      "Revenue",
                      "Employees",
                      "Valuation / employee",
                    ].map((metric, i) => (
                      <tr key={metric}>
                        <th>{metric}</th>
                        {comparison.map((id) => {
                          const c = companies.find((c) => c.id === id)!,
                            v = recordAt(c, date),
                            funding = disclosedFunding(c, date);
                          const values = [
                            v ? money(v.amount) : "Not recorded",
                            v?.type ?? "No record",
                            funding === null ? "Not provided" : money(funding),
                            v && funding
                              ? `${(v.amount / funding).toFixed(1)}×`
                              : "—",
                            c.revenue === null
                              ? "Not provided"
                              : money(c.revenue),
                            number(c.employees),
                            v && c.employees
                              ? money(v.amount / c.employees)
                              : "—",
                          ];
                          return <td key={id}>{values[i]}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                ¹ Sum of disclosed raises in this sparse dataset, not lifetime
                funding. Missing metrics are not estimated.
              </p>
            </section>
          )}

          <div className="camera-tools">
            <button
              title="Reset camera"
              aria-label="Reset camera"
              onClick={home}
            >
              <Home size={17} />
            </button>
            <button
              title={labels ? "Hide labels" : "Show labels"}
              aria-label={labels ? "Hide labels" : "Show labels"}
              onClick={() => setLabels(!labels)}
            >
              {labels ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
            <button
              title="Camera controls"
              aria-label="Camera controls"
              onClick={() => setHelp(!help)}
            >
              <Compass size={18} />
            </button>
            <button
              title="Toggle fullscreen"
              aria-label="Toggle fullscreen"
              onClick={() => {
                if (document.fullscreenElement)
                  void document.exitFullscreen().catch(() => {});
                else
                  void document.documentElement
                    .requestFullscreen?.()
                    .catch(() => {});
              }}
            >
              <Maximize2 size={16} />
            </button>
          </div>
          {help && (
            <div className="controls-help panel">
              <button
                className="icon-button"
                aria-label="Close controls"
                onClick={() => setHelp(false)}
              >
                <X size={14} />
              </button>
              <h3>Make yourself at home.</h3>
              <p>
                <b>Left drag</b> Rotate
                <br />
                <b>Right drag</b> Pan
                <br />
                <b>Scroll / pinch</b> Zoom
                <br />
                <b>Click a building</b> Select & fly to
                <br />
                <b>Double click</b> Fly to company
                <br />
                <b>Touch: one finger</b> Rotate
                <br />
                <b>Touch: two fingers</b> Pan & zoom
                <br />
                <b>/</b> Search & fly to
                <br />
                <b>Esc</b> Close panel
              </p>
            </div>
          )}
          {!comparing && (
            <section
              className={`timeline ${view === "timeline" ? "expanded" : ""}`}
              aria-label="City timeline"
            >
              <div className="timeline-heading">
                <span className="eyebrow">
                  <span className="live-dot" />
                  {year < 2025.7 ? "REWIND THE CITY" : "WATCH AN ECONOMY RISE"}
                </span>
                <span>
                  {formatDate(date).toUpperCase()}
                  {date > SNAPSHOT && <small> · data through SEP 2025</small>}
                </span>
              </div>
              <div className="timeline-track">
                <button
                  className="play-button"
                  aria-label={playing ? "Pause timeline" : "Play timeline"}
                  onClick={() => {
                    if (!playing && year >= latestYear) setYear(2015);
                    setPlaying(!playing);
                  }}
                >
                  {playing ? (
                    <Pause size={14} fill="currentColor" />
                  ) : (
                    <Play size={14} fill="currentColor" />
                  )}
                </button>
                <div className="range-wrap">
                  <input
                    id="time-range"
                    aria-label="Timeline year"
                    aria-valuetext={formatDate(date)}
                    type="range"
                    min={2015}
                    max={latestYear}
                    step={1 / 12}
                    value={year}
                    style={
                      {
                        "--progress": `${((year - 2015) / (latestYear - 2015)) * 100}%`,
                      } as React.CSSProperties
                    }
                    onChange={(e) => {
                      setYear(Number(e.target.value));
                      setPlaying(false);
                    }}
                  />
                  <div className="timeline-years">
                    {[2015, 2018, 2020, 2022, 2024, 2026].map((y) => (
                      <button
                        key={y}
                        style={{
                          left: `${((y - 2015) / (latestYear - 2015)) * 100}%`,
                        }}
                        onClick={() => {
                          setYear(y);
                          setPlaying(false);
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="latest-button"
                  onClick={() => {
                    setYear(latestYear);
                    setPlaying(false);
                  }}
                >
                  LATEST <ChevronRight size={12} />
                </button>
              </div>
              {view === "timeline" && (
                <p className="timeline-explainer">
                  Drag to rebuild the skyline. Buildings appear in their
                  founding year; growth follows recorded valuation events.
                  Construction sites mean no recorded valuation, not zero value.
                  No interpolation or invented rounds.
                </p>
              )}
            </section>
          )}
          <footer className="bottom-bar">
            <div className="market-stat">
              <span>TRACKED VALUATIONS</span>
              <strong>{money(total)}</strong>
            </div>
            <div className="market-stat">
              <span>COMPANIES VALUED</span>
              <strong>
                {valuedCount}
                <small> / {companies.length}</small>
              </strong>
            </div>
            <div className="market-stat data-date">
              <span>DATA THROUGH</span>
              <strong>SEP 2025</strong>
            </div>
            <button className="data-note" onClick={() => setMethodology(true)}>
              A curated map, not a live market.
              <span>
                Data & methodology <ExternalLink size={11} />
              </span>
            </button>
            <div className="navigation-hint">
              DRAG TO ROTATE <i /> SCROLL TO EXPLORE
            </div>
          </footer>
        </>
      )}
      {methodology && (
        <div className="modal-scrim" onClick={() => setMethodology(false)}>
          <section
            className="methodology panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="method-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-top">
              <span className="eyebrow">READING THE CITY</span>
              <button
                autoFocus
                className="icon-button"
                aria-label="Close methodology"
                onClick={() => setMethodology(false)}
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="method-title">Real records. An imagined city.</h2>
            <p>
              This curated dataset covers 20 private AI companies and selected
              events through <b>September 30, 2025</b>. It is incomplete and is
              not a current private-market census. Company ownership and
              valuations may have changed since these events.
            </p>
            <p>
              Each building uses its most recent recorded valuation on or before
              the chosen date. Funding rounds, tenders, acquisition values,
              secondary transactions, discussions, and estimates are distinct
              event types; the original labels appear in company details. The
              total mixes event dates and types and is not a measure of
              investable market capitalization.
            </p>
            <p>
              Height follows <code>2 + 1.55 × valuation⁰·⁶⁸</code> (USD
              billions). Width also increases with valuation. Architectural
              shapes vary, so neither height nor volume is a linear financial
              ratio.
            </p>
            <p>
              Before a first record, a founded company appears as a construction
              site. It has an <b>unknown valuation</b>. Growth animates between
              recorded states for visual continuity; intermediate frames are not
              financial estimates. The 2026 timeline carries forward the last
              supplied records.
            </p>
            <p>
              Funding means only disclosed raises included here, not total
              lifetime funding or necessarily cash already received. Employee
              and revenue figures were not supplied. Sources are accessible on
              every company’s Sources tab. Logos are remotely loaded favicons
              with text fallbacks.
            </p>
            <button
              className="primary-button"
              onClick={() => setMethodology(false)}
            >
              BACK TO THE CITY <ArrowRight size={16} />
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

function CompanyFacts({ company, date }: { company: Company; date: string }) {
  const record = recordAt(company, date),
    history = [...company.history]
      .filter((v) => v.date <= date)
      .sort((a, b) => a.date.localeCompare(b.date));
  const previous = history.at(-2),
    funding = disclosedFunding(company, date);
  const change =
    previous && record ? (record.amount / previous.amount - 1) * 100 : null;
  return (
    <>
      <dl className="facts">
        <div>
          <dt>Previous recorded value</dt>
          <dd>{previous ? money(previous.amount) : "Not provided"}</dd>
        </div>
        <div>
          <dt>Change between records</dt>
          <dd className={change !== null && change >= 0 ? "positive" : ""}>
            {change === null
              ? "—"
              : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
          </dd>
        </div>
        <div>
          <dt>Funding in dataset¹</dt>
          <dd>{funding === null ? "Not provided" : money(funding)}</dd>
        </div>
        <div>
          <dt>Latest recorded event</dt>
          <dd>{record?.round ?? "Not recorded"}</dd>
        </div>
        <div>
          <dt>Founded</dt>
          <dd>{company.founded}</dd>
        </div>
        <div>
          <dt>Employees</dt>
          <dd>{number(company.employees)}</dd>
        </div>
        <div>
          <dt>Estimated revenue</dt>
          <dd>
            {company.revenue === null ? "Not provided" : money(company.revenue)}
          </dd>
        </div>
      </dl>
      <div className="investors">
        <span className="menu-eyebrow">SELECTED INVESTORS · SNAPSHOT</span>
        <p>{company.investors.join(" · ")}</p>
      </div>
      <p className="fine-print">
        ¹ Included disclosed raises only; not lifetime funding. Valuations from
        different transaction types may not be directly comparable.
      </p>
    </>
  );
}
