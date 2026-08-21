import { useEffect, useRef, useState } from "react";

type HeaderProps = {
  dateLabel: string;
  isDisabled: boolean;
  onStartNewDay: () => void;
  onShowPreviousRecords: () => void;
};

function Header({
  dateLabel,
  isDisabled,
  onStartNewDay,
  onShowPreviousRecords,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleDocumentPointerDown(event: MouseEvent) {
      if (!menuContainerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="app-header">
      <div className="header-main">
        <div className="header-date-row">
          <p className="eyebrow">{dateLabel}</p>
        </div>
        <img
          className="brand-logo header-logo"
          src="/logo.svg"
          alt="Today's Focus"
        />
        <p className="header-copy">Make room for the work that matters.</p>
      </div>
      <div className="header-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={onStartNewDay}
          disabled={isDisabled}
        >
          Start Fresh Day
        </button>
        <div className="header-settings" ref={menuContainerRef}>
          <button
            className="icon-button settings-trigger"
            type="button"
            aria-label="Open settings"
            title="Settings"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M19.13 12.94a7.45 7.45 0 0 0 .05-.94 7.45 7.45 0 0 0-.05-.94l2.02-1.58a.5.5 0 0 0 .12-.64l-1.91-3.3a.5.5 0 0 0-.6-.22l-2.39.96a7.63 7.63 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.82a.5.5 0 0 0-.5.42l-.36 2.54c-.58.22-1.12.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22l-1.91 3.3a.5.5 0 0 0 .12.64l2.02 1.58a7.45 7.45 0 0 0-.05.94c0 .32.02.63.05.94l-2.02 1.58a.5.5 0 0 0-.12.64l1.91 3.3a.5.5 0 0 0 .6.22l2.39-.96c.5.41 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .5.42h3.82a.5.5 0 0 0 .5-.42l.36-2.54c.58-.22 1.12-.53 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.91-3.3a.5.5 0 0 0-.12-.64l-2.02-1.58zM12 15.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4z" />
            </svg>
          </button>
          {isMenuOpen && (
            <div
              className="settings-menu"
              role="menu"
              aria-label="Settings menu"
            >
              <button
                type="button"
                role="menuitem"
                className="settings-menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  onShowPreviousRecords();
                }}
              >
                Show previous records
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
