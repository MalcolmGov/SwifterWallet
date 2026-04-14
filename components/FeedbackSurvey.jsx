"use client";

import { useState } from "react";

export default function FeedbackSurvey({ onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    setSent(true);
    if (onSubmit) {
      onSubmit({ rating, comment });
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setSent(false);
    onClose();
  };

  return (
    <div
      className="feedback-overlay"
      onClick={handleClose}
    >
      <div className="feedback-panel" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="feedback-thanks">
            <div className="feedback-thanks-icon">🎉</div>
            <h3>Thank you!</h3>
            <p>Your feedback helps us make Swifter better</p>
            <button
              className="primary-btn primary-violet"
              style={{ width: "100%", marginTop: "0.5rem" }}
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="feedback-header">
              <h3 className="feedback-title">How was your experience?</h3>
              <button
                className="voice-close"
                onClick={() => {
                  onClose();
                  setRating(0);
                  setComment("");
                }}
              >
                ✕
              </button>
            </div>
            <p className="feedback-sub">Rate your last transaction</p>
            <div className="feedback-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`feedback-star ${rating >= star ? "feedback-star-active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <textarea
                className="feedback-textarea"
                placeholder="Optional: tell us more..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            )}
            {rating > 0 && (
              <button
                className="primary-btn primary-violet"
                style={{ width: "100%" }}
                onClick={handleSubmit}
              >
                Submit Feedback
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
