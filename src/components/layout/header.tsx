"use client";
import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, FileDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { config } from "@/data/config";
import ThemeToggle from "@/components/layout/theme-toggle";
import { navigationLinks } from "@/data/navigation";
import styles from "./header.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();

  const navigateAfterClose = () => {
    const href = pendingHref.current;
    pendingHref.current = null;
    if (!href) return;
    const [destination, hash] = href.split("#");
    if (destination === pathname && hash) {
      const target = document.getElementById(hash);
      if (!target) return;
      if (window.location.hash !== "#" + hash)
        window.history.pushState(null, "", href);
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (lenis) {
        lenis.start();
        lenis.scrollTo(target, {
          immediate: reduceMotion,
          force: true,
        });
      } else {
        target.scrollIntoView({
          behavior: reduceMotion ? "instant" : "smooth",
          block: "start",
        });
      }
    } else router.push(href);
  };

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link
          href="/"
          className={styles.brand}
          aria-label={config.author + " home"}
        >
          {config.author}
        </Link>
        <div className={styles.actions}>
          <ThemeToggle className="h-9 w-9" />
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className={styles.menuButton}
                aria-label="Open menu"
              >
                <span>Menu</span>
                <Menu size={19} aria-hidden="true" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.overlay} />
              <Dialog.Content
                className={styles.panel}
                data-lenis-prevent
                onCloseAutoFocus={(event) => {
                  if (pendingHref.current) {
                    event.preventDefault();
                    navigateAfterClose();
                  }
                }}
              >
                <div className={styles.panelTop}>
                  <div>
                    <p className={styles.eyebrow}>FULL STACK · AI · WEB3</p>
                    <Dialog.Title className={styles.title}>
                      Explore the portfolio.
                    </Dialog.Title>
                    <Dialog.Description className={styles.description}>
                      A little about me, what I build, and how to get in touch.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className={styles.closeButton}
                      aria-label="Close menu"
                    >
                      <X size={22} />
                    </button>
                  </Dialog.Close>
                </div>
                <nav aria-label="Main navigation" className={styles.navigation}>
                  {navigationLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={styles.navLink}
                      onClick={(event) => {
                        if (
                          event.metaKey ||
                          event.ctrlKey ||
                          event.shiftKey ||
                          event.altKey
                        )
                          return;
                        event.preventDefault();
                        pendingHref.current = link.href;
                        setOpen(false);
                      }}
                    >
                      <span className={styles.number}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.linkCopy}>
                        <span className={styles.linkTitle}>{link.title}</span>
                        <span className={styles.linkDescription}>
                          {link.description}
                        </span>
                      </span>
                      <ArrowUpRight
                        className={styles.arrow}
                        size={22}
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </nav>
                <div className={styles.panelFooter}>
                  <a href={config.resume} download className={styles.resume}>
                    <FileDown size={16} /> Resume
                  </a>
                  <div className={styles.socials}>
                    <a
                      href={config.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub <ArrowUpRight size={13} />
                    </a>
                    <a
                      href={config.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
