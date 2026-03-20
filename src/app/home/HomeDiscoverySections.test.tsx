import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { HomeDiscoverySections } from "./HomeDiscoverySections";

function renderSections(overrides: Partial<ComponentProps<typeof HomeDiscoverySections>> = {}) {
  const onRetryForYou = jest.fn();
  const onRetryTrending = jest.fn();
  const onRetryFeatured = jest.fn();

  render(
    <HomeDiscoverySections
      choreoEnabled={false}
      hasUser
      forYouLoading={false}
      forYouError={null}
      forYouBusinesses={[
        { id: "f1", name: "For You 1" } as any,
      ]}
      trendingLoading={false}
      trendingError={null}
      hasTrendingBusinesses
      trendingBusinesses={[
        { id: "t1", name: "Trending 1" } as any,
      ]}
      featuredError={null}
      featuredLoading={false}
      featuredByCategory={[
        { id: "c1", category: "food" } as any,
      ]}
      onRetryForYou={onRetryForYou}
      onRetryTrending={onRetryTrending}
      onRetryFeatured={onRetryFeatured}
      renderBusinessRow={({ title, businesses }) => (
        <div>{`Row:${title}:${businesses.length}`}</div>
      )}
      renderEventsSpecials={() => <div>EventsSection</div>}
      renderCommunityHighlights={(items) => <div>{`Community:${items.length}`}</div>}
      {...overrides}
    />
  );

  return { onRetryForYou, onRetryTrending, onRetryFeatured };
}

describe("HomeDiscoverySections", () => {
  it("does not render filtered results in discovery mode", () => {
    renderSections();

    expect(screen.queryByText("Filtered Results")).not.toBeInTheDocument();
    expect(screen.getByText("Row:For You:1")).toBeInTheDocument();
    expect(screen.getByText("Row:Trending Now:1")).toBeInTheDocument();
  });

  it("shows guest CTA card when user is signed out", () => {
    renderSections({ hasUser: false });

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("shows retry actions for trending and featured errors", () => {
    const { onRetryTrending, onRetryFeatured } = renderSections({
      trendingError: "500: failed",
      featuredError: "500: failed",
      hasTrendingBusinesses: false,
      trendingBusinesses: [],
    });

    const reloadButtons = screen.getAllByRole("button", { name: "Reload" });
    expect(reloadButtons).toHaveLength(2);

    fireEvent.click(reloadButtons[0]);
    fireEvent.click(reloadButtons[1]);

    expect(onRetryTrending).toHaveBeenCalledTimes(1);
    expect(onRetryFeatured).toHaveBeenCalledTimes(1);
  });

  it("shows retry action for For You errors", () => {
    const { onRetryForYou } = renderSections({
      forYouError: "500: failed",
      forYouBusinesses: [],
    });

    fireEvent.click(screen.getByRole("button", { name: "Reload" }));

    expect(onRetryForYou).toHaveBeenCalledTimes(1);
  });
});
