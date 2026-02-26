"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  AB_QUESTIONS,
  SLIDERS,
  BREED_PROFILES,
  initialScores,
  applyABChoice,
  applySliderAdjustments,
  getWinningBreed,
  calculateFundAllocation,
} from "@/data/eyetest";
import { FUNDS } from "@/data/funds";
import { createInvestorProfile } from "@/utils/investor-profiles";
import type {
  EyeTestStep,
  BreedScores,
  SliderValues,
  FundAllocation,
  InvestorBreed,
} from "@/types/investor";
import styles from "./EyeTest.module.css";

// ── Fund display names for allocation bars ────────────────────
const FUND_DISPLAY: Record<string, { name: string; color: string }> = {
  bobwhite: { name: "Bobwhite Fund", color: FUNDS.bobwhite.color },
  pheasant: { name: "Pheasant Fund", color: FUNDS.pheasant.color },
  chukar: { name: "Chukar Fund", color: FUNDS.chukar.color },
  woodcock: { name: "Woodcock Fund", color: FUNDS.woodcock.color },
  grouse: { name: "Grouse Fund", color: FUNDS.grouse.color },
  debt: { name: "Covey Debt Fund", color: "#8B7355" },
};

export default function EyeTestPage() {
  // ── State machine ─────────────────────────────────────────
  const [step, setStep] = useState<EyeTestStep>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [abResponses, setAbResponses] = useState<Record<string, "A" | "B">>({});
  const [sliderValues, setSliderValues] = useState<SliderValues>(() => {
    const defaults: SliderValues = {};
    for (const s of SLIDERS) {
      defaults[s.id] = s.defaultValue;
    }
    return defaults;
  });
  const [scores, setScores] = useState<BreedScores>(initialScores);
  const [winningBreed, setWinningBreed] = useState<InvestorBreed>("brittany");
  const [allocation, setAllocation] = useState<FundAllocation[]>([]);
  const [saving, setSaving] = useState(false);

  // ── Handlers ──────────────────────────────────────────────

  const handleStart = useCallback(() => {
    setStep("ab");
    setQuestionIndex(0);
    setAbResponses({});
    setScores(initialScores());
    setSliderValues(() => {
      const defaults: SliderValues = {};
      for (const s of SLIDERS) {
        defaults[s.id] = s.defaultValue;
      }
      return defaults;
    });
  }, []);

  const handleABChoice = useCallback(
    (choice: "A" | "B") => {
      const question = AB_QUESTIONS[questionIndex];
      const newResponses = { ...abResponses, [question.id]: choice };
      setAbResponses(newResponses);

      const newScores = applyABChoice(scores, question, choice);
      setScores(newScores);

      // Auto-advance after brief delay
      setTimeout(() => {
        if (questionIndex < AB_QUESTIONS.length - 1) {
          setQuestionIndex(questionIndex + 1);
        } else {
          setStep("sliders");
        }
      }, 300);
    },
    [questionIndex, abResponses, scores],
  );

  const handleBack = useCallback(() => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  }, [questionIndex]);

  const handleSliderChange = useCallback(
    (sliderId: string, value: number) => {
      setSliderValues((prev) => ({ ...prev, [sliderId]: value }));
    },
    [],
  );

  const handleSeeResults = useCallback(async () => {
    // Apply slider adjustments to accumulated scores
    const finalScores = applySliderAdjustments(scores, SLIDERS, sliderValues);
    setScores(finalScores);

    const breed = getWinningBreed(finalScores);
    setWinningBreed(breed);

    const alloc = calculateFundAllocation(finalScores);
    setAllocation(alloc);

    setStep("reveal");

    // Save to Supabase in background
    setSaving(true);
    await createInvestorProfile({
      breed,
      scores: finalScores,
      responses: { ab: abResponses, sliders: sliderValues },
      fundAllocation: alloc,
    });
    setSaving(false);
  }, [scores, sliderValues, abResponses]);

  const handleSeePortfolio = useCallback(() => {
    setStep("recommendation");
  }, []);

  const handleRetake = useCallback(() => {
    setStep("intro");
  }, []);

  // ── Render ────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      {/* ── INTRO ──────────────────────────────────────────── */}
      {step === "intro" && (
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Compass</h1>
          <p className={styles.heroTagline}>
            Check your bearing. Know your heading.
          </p>
          <p className={styles.heroSubtitle}>
            Eight comparisons. Five calibrations. One investor profile mapped to your Covey fund allocation.
          </p>
          <button className={styles.startButton} onClick={handleStart}>
            Find Your Bearing
          </button>
        </div>
      )}

      {/* ── A/B QUESTIONS ──────────────────────────────────── */}
      {step === "ab" && (
        <div className={styles.abSection}>
          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              Question {questionIndex + 1} of {AB_QUESTIONS.length}
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${((questionIndex + 1) / AB_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <h2 className={styles.abPrompt}>
            {AB_QUESTIONS[questionIndex].prompt}
          </h2>

          <div className={styles.abCards}>
            <button
              className={`${styles.abCard} ${
                abResponses[AB_QUESTIONS[questionIndex].id] === "A"
                  ? styles.abCardSelected
                  : ""
              }`}
              onClick={() => handleABChoice("A")}
            >
              <div className={styles.abCardLetter}>A</div>
              <div className={styles.abCardLabel}>
                {AB_QUESTIONS[questionIndex].optionA.label}
              </div>
              <p className={styles.abCardDesc}>
                {AB_QUESTIONS[questionIndex].optionA.description}
              </p>
            </button>

            <button
              className={`${styles.abCard} ${
                abResponses[AB_QUESTIONS[questionIndex].id] === "B"
                  ? styles.abCardSelected
                  : ""
              }`}
              onClick={() => handleABChoice("B")}
            >
              <div className={styles.abCardLetter}>B</div>
              <div className={styles.abCardLabel}>
                {AB_QUESTIONS[questionIndex].optionB.label}
              </div>
              <p className={styles.abCardDesc}>
                {AB_QUESTIONS[questionIndex].optionB.description}
              </p>
            </button>
          </div>

          {questionIndex > 0 && (
            <button className={styles.backButton} onClick={handleBack}>
              &larr; Back
            </button>
          )}
        </div>
      )}

      {/* ── SLIDERS ────────────────────────────────────────── */}
      {step === "sliders" && (
        <div className={styles.slidersSection}>
          <h2 className={styles.slidersTitle}>Calibrate</h2>
          <p className={styles.slidersSubtitle}>
            Dial in your position and your heading
          </p>

          {SLIDERS.map((slider) => (
            <div key={slider.id} className={styles.sliderCard}>
              <div className={styles.sliderLabel}>{slider.label}</div>
              <div className={styles.sliderDesc}>{slider.description}</div>
              <div className={styles.sliderTrack}>
                <span className={styles.sliderEndLabel}>
                  {slider.leftLabel}
                </span>
                <input
                  type="range"
                  className={styles.sliderInput}
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={sliderValues[slider.id]}
                  onChange={(e) =>
                    handleSliderChange(slider.id, Number(e.target.value))
                  }
                />
                <span
                  className={`${styles.sliderEndLabel} ${styles.sliderEndLabelRight}`}
                >
                  {slider.rightLabel}
                </span>
              </div>
              <div className={styles.sliderValue}>
                {sliderValues[slider.id]}
                {slider.id === "min_yield" ? "%" : ""}
                {slider.id === "time_horizon" ? " years" : ""}
              </div>
            </div>
          ))}

          <button className={styles.resultsButton} onClick={handleSeeResults}>
            See My Profile
          </button>
        </div>
      )}

      {/* ── REVEAL ─────────────────────────────────────────── */}
      {step === "reveal" && (
        <div className={styles.revealSection}>
          <h1 className={styles.revealBreedName}>
            {BREED_PROFILES[winningBreed].name}
          </h1>
          <p className={styles.revealDogBreed}>
            {BREED_PROFILES[winningBreed].dogBreed}
          </p>
          <p
            className={styles.revealTagline}
            style={{ color: BREED_PROFILES[winningBreed].color }}
          >
            &ldquo;{BREED_PROFILES[winningBreed].tagline}&rdquo;
          </p>
          <p className={styles.revealDescription}>
            {BREED_PROFILES[winningBreed].description}
          </p>
          <div className={styles.revealTraits}>
            {BREED_PROFILES[winningBreed].traits.map((trait) => (
              <span
                key={trait}
                className={styles.traitPill}
                style={{
                  backgroundColor: BREED_PROFILES[winningBreed].color,
                }}
              >
                {trait}
              </span>
            ))}
          </div>
          <button
            className={styles.revealCta}
            onClick={handleSeePortfolio}
            disabled={saving}
          >
            {saving ? "Saving..." : "See My Allocation"}
          </button>
        </div>
      )}

      {/* ── RECOMMENDATION ─────────────────────────────────── */}
      {step === "recommendation" && (
        <div className={styles.recoSection}>
          <h2 className={styles.recoTitle}>Your Recommended Allocation</h2>
          <p className={styles.recoSubtitle}>
            Your heading as a {BREED_PROFILES[winningBreed].name} —
            recalibrate when conditions shift
          </p>

          <div className={styles.allocationList}>
            {allocation
              .sort((a, b) => b.percentage - a.percentage)
              .map((item) => {
                const display = FUND_DISPLAY[item.fund];
                return (
                  <div key={item.fund} className={styles.allocationRow}>
                    <span className={styles.allocationLabel}>
                      {display?.name ?? item.fund}
                    </span>
                    <div className={styles.allocationBarWrap}>
                      <div
                        className={styles.allocationBar}
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: display?.color ?? "#999",
                        }}
                      />
                    </div>
                    <span className={styles.allocationPct}>
                      {item.percentage}%
                    </span>
                  </div>
                );
              })}
          </div>

          <div className={styles.recoActions}>
            <Link href="/coveyselect" className={styles.exploreFundsLink}>
              View My CoveySelect Funds
            </Link>
            <button className={styles.retakeButton} onClick={handleRetake}>
              Recalibrate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
