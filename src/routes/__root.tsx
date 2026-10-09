import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1f1510" },
      { title: "OpenPour" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap",
      },
      {
        rel: "preload",
        href: "/fonts/PaperMono-Variable.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: Outlet,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Message({
  title,
  body,
  failed = false,
  children,
}: {
  title: string;
  body: string;
  failed?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 sm:px-8">
      {failed && <span className="mb-8 block h-1 w-14 bg-ember" aria-hidden="true" />}
      <h1 className="wide text-[clamp(2.5rem,8vw,4.5rem)] text-balance">{title}</h1>
      <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-husk">{body}</p>
      <div className="mt-10 flex flex-wrap gap-6">{children}</div>
    </main>
  );
}

const primaryAction =
  "rounded-full bg-water px-6 py-3 font-semibold text-roast transition-colors hover:bg-crema";

function NotFound() {
  return (
    <Message
      title="Nothing poured here."
      body="This address doesn't match a page on the OpenPour site. The build files and guides are all on the home page."
    >
      <Link to="/" className={primaryAction}>
        Go to the home page
      </Link>
    </Message>
  );
}

function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  console.error(error);
  return (
    <Message
      title="This page failed to load."
      failed
      body="Reload to try again. If it keeps failing, the build files are still on GitHub."
    >
      <button
        type="button"
        className={primaryAction}
        onClick={() => {
          void router.invalidate();
          reset();
        }}
      >
        Reload
      </button>
      <a
        href="https://github.com/cjodo/openpour"
        className="self-center underline underline-offset-4"
      >
        Open cjodo/openpour
      </a>
    </Message>
  );
}
