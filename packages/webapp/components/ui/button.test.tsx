import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("should render a button with default props", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass("bg-primary text-primary-foreground");
	});

	it("should apply variant and size classes", () => {
		render(
			<Button variant="destructive" size="sm">
				Delete
			</Button>,
		);
		const button = screen.getByRole("button", { name: /delete/i });
		expect(button).toHaveClass("bg-destructive text-white");
		expect(button).toHaveClass("h-8 rounded-md");
	});

	it("should render as a child component when asChild is true", () => {
		render(
			<Button asChild>
				<a href="/">Link</a>
			</Button>,
		);
		const link = screen.getByRole("link", { name: /link/i });
		expect(link).toBeInTheDocument();
		// The component inside is expected to receive the button classes
		expect(link).toHaveClass("bg-primary");
	});

	it("should forward onClick handler", () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Clickable</Button>);
		const button = screen.getByRole("button", { name: /clickable/i });
		button.click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("should be disabled when the disabled prop is true", () => {
		render(<Button disabled>Disabled</Button>);
		const button = screen.getByRole("button", { name: /disabled/i });
		expect(button).toBeDisabled();
	});
});
