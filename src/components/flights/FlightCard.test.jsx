import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FlightCard from "./FlightCard";

const mockFlight = {
  owner: { name: "Test Airways", logo_symbol_url: null },
  slices: [{
    origin: { iata_code: "NBO" },
    destination: { iata_code: "CDG" },
    segments: [{
      departing_at: "2026-05-20T10:00:00",
      arriving_at: "2026-05-20T18:00:00",
    }],
  }],
  total_currency: "USD",
  total_amount: "500.00",
};

describe("FlightCard", () => {
  it("renders flight details", () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText("Test Airways")).toBeInTheDocument();
    expect(screen.getByText("NBO → CDG")).toBeInTheDocument();
    expect(screen.getByText("USD 500.00")).toBeInTheDocument();
  });

  it("returns null for invalid flight", () => {
    const { container } = render(<FlightCard flight={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows direct for non-stop flight", () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText("Stops: Direct")).toBeInTheDocument();
  });
});
