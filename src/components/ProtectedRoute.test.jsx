import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ currentUser: null, loading: false }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }) => <div>Redirecting to {to}</div>,
  };
});

describe("ProtectedRoute", () => {
  it("redirects to login when not authenticated", () => {
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText("Redirecting to /login")).toBeInTheDocument();
  });
});
