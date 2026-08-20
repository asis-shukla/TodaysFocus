import { useEffect, useRef } from "react";

type ResetConfirmationDialogProps = {
  isOpen: boolean;
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ResetConfirmationDialog({ isOpen, isBusy, onConfirm, onCancel }: ResetConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="reset-dialog"
      aria-labelledby="reset-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div className="reset-dialog-content">
        <p className="section-kicker">Reset today</p>
        <h2 id="reset-dialog-title">Start fresh?</h2>
        <p>
          Today&apos;s goals, timers, completed work, tracked durations, and notes will be cleared.
        </p>
        <div className="reset-dialog-actions">
          <button className="button button-secondary" type="button" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button className="button button-primary" type="button" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? "Starting..." : "Start Fresh Day"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default ResetConfirmationDialog;