import { fireEvent, render, screen } from "@testing-library/react";
import HomeClient from "./HomeClient";

const mockSetDistanceKm = jest.fn();
const mockSetMinRating = jest.fn();
const mockResetFilters = jest.fn();

jest.mock("../hooks/usePageTitle", () => ({
  usePredefinedPageTitle: () => undefined,
}));

jest.mock("../hooks/useIsDesktop", () => ({
  useIsDesktop: () => true,
}));

jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));

jest.mock("../hooks/useUserPreferences", () => ({
  useUserPreferences: () => ({
    interests: [],
    subcategories: [],
    dealbreakers: [],
    loading: false,
  }),
}));

jest.mock("../hooks/useBusinesses", () => ({
  useForYouBusinesses: () => ({
    businesses: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useTrendingBusinesses: () => ({
    businesses: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock("../hooks/useFeaturedBusinesses", () => ({
  useFeaturedBusinesses: () => ({
    featuredBusinesses: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock("../hooks/useRoutePrefetch", () => ({
  useRoutePrefetch: () => undefined,
}));

jest.mock("./hooks/useHomeEventsSpecials", () => ({
  useHomeEventsSpecials: () => ({ eventsAndSpecials: [], eventsAndSpecialsLoading: false }),
}));

jest.mock("./hooks/useHomeHeroReadiness", () => ({
  useHomeHeroReadiness: () => ({ heroReady: true }),
}));

jest.mock("./hooks/useHomeDebugLogs", () => ({
  useHomeBusinessCountsDebug: () => undefined,
  useHomePreferencesDebug: () => undefined,
}));

jest.mock("./hooks/useHomeRealtimeFeedSync", () => ({
  useHomeRealtimeFeedSync: () => undefined,
}));

jest.mock("./hooks/useHomeSearchState", () => ({
  useHomeSearchState: () => ({
    searchQueryParam: "pizza",
    liveQuery: "pizza",
    liveLoading: false,
    liveResults: [],
    liveError: null,
    liveFilters: { distanceKm: null, minRating: null },
    setDistanceKm: mockSetDistanceKm,
    setMinRating: mockSetMinRating,
    resetFilters: mockResetFilters,
    isSearchActive: true,
    searchPanelQuery: "pizza",
  }),
}));

jest.mock("./HomeDiscoverySections", () => ({
  HomeDiscoverySections: () => <div>DiscoverySectionsMock</div>,
}));

jest.mock("./homeClient.components", () => {
  const SearchResultsPanel = require("../components/SearchResultsPanel/SearchResultsPanel").default;
  return {
    HeroCarousel: () => <div>HeroCarousel</div>,
    EventsSpecials: () => <div>EventsSpecials</div>,
    CommunityHighlights: () => <div>CommunityHighlights</div>,
    Footer: () => <div>Footer</div>,
    HeroSkeleton: () => <div>HeroSkeleton</div>,
    MobileHeroSkeleton: () => <div>MobileHeroSkeleton</div>,
    MemoizedBusinessRow: ({ title }: { title: string }) => <div>{title}</div>,
    SearchResultsPanel,
  };
});

describe("HomeClient search mode", () => {
  beforeEach(() => {
    mockSetDistanceKm.mockClear();
    mockSetMinRating.mockClear();
    mockResetFilters.mockClear();
    Object.defineProperty(window, "scrollTo", {
      value: jest.fn(),
      writable: true,
    });
  });

  it("renders search mode for /home?search and keeps discovery mode hidden", () => {
    render(<HomeClient />);

    expect(screen.getByText('Results for "pizza"')).toBeInTheDocument();
    expect(screen.queryByText("DiscoverySectionsMock")).not.toBeInTheDocument();
  });

  it("renders distance/rating pills and forwards filter changes", () => {
    render(<HomeClient />);

    fireEvent.click(screen.getByRole("button", { name: "3 km" }));
    fireEvent.click(screen.getByRole("button", { name: "4.5+" }));

    expect(mockSetDistanceKm).toHaveBeenCalledWith(3);
    expect(mockSetMinRating).toHaveBeenCalledWith(4.5);
    expect(screen.getByText('No matches found for "pizza". Try adjusting your spelling or filters.')).toBeInTheDocument();
  });
});
