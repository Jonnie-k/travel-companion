import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HotelCard from "./HotelCard";

const mockHotel = {
  id: 1,
  name: "Test Hotel",
  country: "Kenya",
  region: "Nairobi",
  type: "hotel",
  bookingUrl: "https://booking.com/test",
};

describe("HotelCard", () => {
  it("renders hotel name", () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText("Test Hotel")).toBeInTheDocument();
  });

  it("renders hotel location", () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText("Nairobi, Kenya")).toBeInTheDocument();
  });

  it("renders booking link", () => {
    render(<HotelCard hotel={mockHotel} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://booking.com/test");
  });

  it("returns null for missing hotel", () => {
    const { container } = render(<HotelCard hotel={null} />);
    expect(container.firstChild).toBeNull();
  });
});
