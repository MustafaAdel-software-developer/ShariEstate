"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const NavigationContext = createContext<{ pending: boolean }>({ pending: false });

export function useNavigationPending() {
  return useContext(NavigationContext).pending;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const timeout = window.setTimeout(() => setPending(false), 12000);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Ignore clicks on controls nested inside cards/links (e.g. favorite heart).
      if (target.closest("button, input, textarea, select, label, [role='button'], [data-prevent-nav]")) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (href === pathname || href.split("#")[0] === pathname) return;

      setPending(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ pending }}>
      {pending && (
        <>
          <div
            className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-emerald-100"
            role="progressbar"
            aria-label="Loading page"
          >
            <div className="h-full w-1/3 animate-nav-progress bg-emerald-600" />
          </div>
          <div
            className="pointer-events-none fixed inset-0 z-[90] bg-white/40 backdrop-blur-[1px]"
            aria-hidden
          />
        </>
      )}
      {children}
    </NavigationContext.Provider>
  );
}
