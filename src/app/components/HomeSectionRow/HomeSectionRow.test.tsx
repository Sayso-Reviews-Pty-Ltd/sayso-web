import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { HomeSectionRow } from "./HomeSectionRow";

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("framer-motion", () => ({
  m: {
    h2: ({ children, className, style }: React.ComponentProps<"h2">) => (
      <h2 className={className} style={style}>{children}</h2>
    ),
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockPush = jest.fn();

beforeEach(() => {
  mockPush.mockClear();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

function renderRow(props: Partial<React.ComponentProps<typeof HomeSectionRow>> = {}) {
  render(
    <HomeSectionRow title="Trending Now" cta="See More" href="/trending" {...props}>
      <div data-testid="content">Content</div>
    </HomeSectionRow>
  );
}

// ── Core ─────────────────────────────────────────────────────────────────────

describe("HomeSectionRow — core", () => {
  it("renders the section title", () => {
    renderRow();
    expect(screen.getByRole("heading", { name: "Trending Now" })).toBeInTheDocument();
  });

  it("sets aria-label on the section from title", () => {
    renderRow();
    expect(screen.getByRole("region", { name: "Trending Now" })).toBeInTheDocument();
  });

  it("renders children directly inside the container", () => {
    renderRow();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});

// ── CTA button ────────────────────────────────────────────────────────────────

describe("HomeSectionRow — CTA button", () => {
  it("renders the CTA button with correct aria-label", () => {
    renderRow();
    expect(screen.getByRole("button", { name: /See More: Trending Now/i })).toBeInTheDocument();
  });

  it("navigates to href when CTA is clicked", () => {
    renderRow();
    fireEvent.click(screen.getByRole("button", { name: /See More: Trending Now/i }));
    expect(mockPush).toHaveBeenCalledWith("/trending");
  });

  it("does not render CTA button when cta is omitted", () => {
    renderRow({ cta: undefined, href: undefined });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("hides CTA when showHeaderCta is false", () => {
    renderRow({ showHeaderCta: false });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("capitalises each word of the CTA label", () => {
    renderRow({ cta: "view all" });
    expect(screen.getByText("View All")).toBeInTheDocument();
  });
});

// ── Heading variants ──────────────────────────────────────────────────────────

describe("HomeSectionRow — heading", () => {
  it("renders with disableAnimations using a plain h2", () => {
    renderRow({ disableAnimations: true });
    expect(screen.getByRole("heading", { name: "Trending Now" })).toBeInTheDocument();
  });

  it("renders titleSlot instead of default heading", () => {
    renderRow({ titleSlot: <h2>Custom Title</h2> });
    expect(screen.getByRole("heading", { name: "Custom Title" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Trending Now" })).not.toBeInTheDocument();
  });

  it("still uses title for aria-label when titleSlot is provided", () => {
    renderRow({ titleSlot: <h2>Custom Title</h2> });
    expect(screen.getByRole("region", { name: "Trending Now" })).toBeInTheDocument();
  });
});

// ── Filter slot ───────────────────────────────────────────────────────────────

describe("HomeSectionRow — filterSlot", () => {
  it("renders filterSlot content between header and children", () => {
    renderRow({ filterSlot: <div data-testid="filters">Filter Pills</div> });
    expect(screen.getByTestId("filters")).toBeInTheDocument();
  });

  it("does not render filter wrapper when filterSlot is omitted", () => {
    renderRow();
    expect(screen.queryByTestId("filters")).not.toBeInTheDocument();
  });
});
