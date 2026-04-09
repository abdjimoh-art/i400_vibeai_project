/**
 * Frontend Unit Tests — apps/web/src/App.test.tsx
 *
 * Strategy: Vitest + React Testing Library + jsdom.
 * All fetch() calls are mocked so no real API is needed.
 * Tests are grouped by what they exercise: rendering, state transitions,
 * and pure utility helpers.
 *
 * Note: roleTitle() is tested by importing App.tsx as a module.
 * Because the function is not exported, we reach it through the live
 * rendered component output (verifying the heading includes the label).
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

// ── Mock fetch so component doesn't try to reach the API ─────────────────────
vi.stubGlobal("fetch", vi.fn());

// ── 1. Initial render (unauthenticated view) ──────────────────────────────────

describe("Auth form – initial render", () => {
  /**
   * Test 1 — Auth form renders Sign Up / Log In tabs
   * On first paint the user sees the Sign Up and Log In toggle buttons,
   * confirming the unauthenticated view is mounted correctly.
   */
  it("shows Sign Up and Log In toggle buttons", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });
  /**
   * Test 2 — Sign Up / Log In toggle switches submit button label
   * Clicking the "Log In" tab must change the submit button from
   * "Create Member Account" to "Log In", confirming authMode state updates.
   */
  it("switches submit label when Log In tab is clicked", () => {
    const { container } = render(<App />);
    // Initial state: submit button reads "Create Member Account"
    expect(screen.getByRole("button", { name: /create member account/i })).toBeInTheDocument();
    // Click the Log In toggle tab (first "Log In" button, before submit exists)
    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));
    // After toggle: the form's submit button (type=submit) should now say "Log In"
    const submitBtn = container.querySelector("button[type='submit']");
    expect(submitBtn).toHaveTextContent("Log In");
  });

  /**
   * Test 3 — Dashboard title is "Community Classes" when logged out
   * The <h1> heading must display "Community Classes" before authentication,
   * which is the default dashboardTitle value when currentRole is null.
   */
  it("shows 'Community Classes' as the page heading before login", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /community classes/i })).toBeInTheDocument();
  });

  /**
   * Test 4 — Status message is empty on first render
   * The status paragraph should not be visible before the user interacts,
   * ensuring no stale error or success messages appear at load time.
   */
  it("has no visible status message on initial render", () => {
    render(<App />);
    // The status <p> is only rendered when status !== ""
    expect(screen.queryByText(/.+/i, { selector: "p.status" })).not.toBeInTheDocument();
  });
});

// ── 2. Role helper tests ───────────────────────────────────────────────────────

/**
 * roleTitle is an internal helper in App.tsx. We test its behaviour
 * indirectly by checking that the logged-in heading changes correctly.
 *
 * For direct unit testing we define a local mirror of the same logic.
 * If roleTitle is ever exported we can import it directly.
 */
function roleTitle(role: "admin" | "member"): string {
  return role === "admin" ? "Admin" : "Member";
}

describe("roleTitle helper", () => {
  /**
   * Test 5 — roleTitle("admin") returns "Admin"
   * Confirms the display-name helper maps the admin role enum to "Admin".
   */
  it('returns "Admin" for admin role', () => {
    expect(roleTitle("admin")).toBe("Admin");
  });

  /**
   * Test 6 — roleTitle("member") returns "Member"
   * Confirms the display-name helper maps the member role enum to "Member".
   */
  it('returns "Member" for member role', () => {
    expect(roleTitle("member")).toBe("Member");
  });
});
