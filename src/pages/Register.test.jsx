import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Register from "./Register";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Register", () => {
  it("redirects to login on mount", () => {
    render(<Register />);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
