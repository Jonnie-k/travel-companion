import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loading from "./Loading";

describe("Loading", () => {
  it("renders default message", () => {
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<Loading message="Searching flights..." />);
    expect(screen.getByText("Searching flights...")).toBeInTheDocument();
  });
});
