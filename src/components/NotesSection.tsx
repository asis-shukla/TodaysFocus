import { useEffect, useRef, useState } from "react";

interface NotesSectionProps {
  notes: string;
  isDisabled: boolean;
  onSaveNotes: (notes: string) => Promise<void>;
}

function NotesSection({ notes, isDisabled, onSaveNotes }: NotesSectionProps) {
  const [draftNotes, setDraftNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmountingRef = useRef(false);
  const draftNotesRef = useRef(notes);

  // Keep ref in sync with draftNotes for use in cleanup function
  useEffect(() => {
    draftNotesRef.current = draftNotes;
  }, [draftNotes]);

  // Sync props.notes into draftNotes when notes change (e.g., on refresh or day change)
  useEffect(() => {
    setDraftNotes(notes);
  }, [notes]);

  // Save notes to IndexedDB
  async function saveNotes(notesToSave: string) {
    // Only save if there's a difference
    if (notesToSave === notes) {
      return;
    }

    setIsSaving(true);
    setLocalError(null);

    try {
      await onSaveNotes(notesToSave);
    } catch (error) {
      // Error is already set by App.tsx storageError, but also display locally
      if (!isUnmountingRef.current) {
        setLocalError("Your notes could not be saved. Please try again.");
      }
    } finally {
      if (!isUnmountingRef.current) {
        setIsSaving(false);
      }
    }
  }

  // Handle onChange: debounce the save
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    if (isDisabled || isSaving) {
      return; // Prevent edits when disabled
    }

    const newValue = event.target.value;
    setDraftNotes(newValue);

    // Cancel pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (1000ms)
    debounceTimerRef.current = setTimeout(() => {
      void saveNotes(newValue);
    }, 1000);
  }

  // Handle blur: flush pending notes immediately
  function handleBlur() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // If draftNotes differs from saved notes, save immediately
    if (draftNotes !== notes && !isSaving && !isDisabled) {
      void saveNotes(draftNotes);
    }
  }

  // Handle unmount: flush pending notes before component unmounts
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;

      // Cancel pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // If there are unsaved changes, initiate save (fire and forget)
      if (draftNotesRef.current !== notes && !isDisabled) {
        void onSaveNotes(draftNotesRef.current);
      }
    };
  }, []); // Empty dependency array - only run on unmount/unmount

  const errorId = localError ? "notes-error" : undefined;

  return (
    <section className="notes-section" aria-labelledby="notes-heading">
      <div>
        <p className="section-kicker">Close the loop</p>
        <h2 id="notes-heading">Daily reflection</h2>
        <p className="section-description">Capture a win, a blocker, or what you want to carry forward.</p>
      </div>
      <label className="visually-hidden" htmlFor="daily-notes">Daily reflection notes</label>
      <textarea
        id="daily-notes"
        name="notes"
        rows={5}
        placeholder="What did you learn today?"
        value={draftNotes}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isDisabled || isSaving}
        aria-invalid={Boolean(localError)}
        aria-describedby={errorId}
      />
      {localError && (
        <p id="notes-error" className="field-error" role="alert">
          {localError}
        </p>
      )}
    </section>
  );
}

export default NotesSection;
