export function Footer() {
  return (
    <footer className="border-t border-ink-100 px-6 py-10 dark:border-ink-700">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-ink-400 md:flex-row">
        <span>© {new Date().getFullYear()} Scriptura. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-ink-700 dark:hover:text-vellum-100">Privacy</a>
          <a href="#" className="hover:text-ink-700 dark:hover:text-vellum-100">Terms</a>
          <a href="#contact" className="hover:text-ink-700 dark:hover:text-vellum-100">Contact</a>
        </div>
      </div>
    </footer>
  );
}
