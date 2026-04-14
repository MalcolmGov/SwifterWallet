"use client";

import { ONBOARDING_SLIDES } from "../src/lib/data";

export default function OnboardingCarousel({ slides = ONBOARDING_SLIDES, currentStep, onStepChange, onComplete }) {
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-bg-glow" />
      <button
        className="onboarding-skip"
        onClick={() => {
          onComplete();
        }}
      >
        Skip
      </button>
      <div className="onboarding-slides-viewport">
        <div
          className="onboarding-slides"
          style={{ transform: `translateX(-${currentStep * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="onboarding-slide">
              <div className="onboarding-emoji">{slide.emoji}</div>
              <h2 className="onboarding-title">{slide.title}</h2>
              <p className="onboarding-body">{slide.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="onboarding-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`onboarding-dot ${i === currentStep ? "onboarding-dot-active" : ""}`}
            onClick={() => onStepChange(i)}
          />
        ))}
      </div>
      {currentStep < slides.length - 1 ? (
        <button
          className="primary-btn primary-violet onboarding-next"
          onClick={() => onStepChange(currentStep + 1)}
        >
          Next
        </button>
      ) : (
        <button
          className="primary-btn primary-violet onboarding-next"
          onClick={() => {
            onComplete();
          }}
        >
          Get Started →
        </button>
      )}
    </div>
  );
}
