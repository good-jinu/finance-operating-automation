import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboard } from "@/hooks/useDashboard";
import MailsPage from "./page";

// Mock the useDashboard hook
vi.mock("@/hooks/useDashboard", () => ({
	useDashboard: vi.fn(),
}));

// Mock the child components to simplify the test
vi.mock("@/components/dashboard/tabs/DashboardTab", () => ({
	default: () => <div>Dashboard Tab Content</div>,
}));
vi.mock("@/components/dashboard/tabs/DatabaseTab", () => ({
	default: () => <div>Database Tab Content</div>,
}));

describe("MailsPage", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("should render the dashboard tab by default", () => {
		const setActiveTab = vi.fn();
		vi.mocked(useDashboard).mockReturnValue({
			activeTab: "dashboard",
			setActiveTab,
		});

		render(<MailsPage />);

		expect(screen.getByText("Dashboard Tab Content")).toBeInTheDocument();
		expect(screen.queryByText("Database Tab Content")).not.toBeInTheDocument();
	});

	it("should render the database tab when it is active", () => {
		const setActiveTab = vi.fn();
		vi.mocked(useDashboard).mockReturnValue({
			activeTab: "database",
			setActiveTab,
		});

		render(<MailsPage />);

		expect(screen.getByText("Database Tab Content")).toBeInTheDocument();
		expect(screen.queryByText("Dashboard Tab Content")).not.toBeInTheDocument();
	});

	it("should call setActiveTab when a tab is clicked", async () => {
		const user = userEvent.setup();
		const setActiveTab = vi.fn();
		vi.mocked(useDashboard).mockReturnValue({
			activeTab: "dashboard",
			setActiveTab,
		});

		render(<MailsPage />);

		const databaseTabTrigger = screen.getByRole("tab", {
			name: /데이터베이스/i,
		});
		await user.click(databaseTabTrigger);

		expect(setActiveTab).toHaveBeenCalledWith("database");
	});
});
