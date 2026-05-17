import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Login from "./Login";

// Mock useAuth
const mockSignIn = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignIn,
    currentUser: null,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Page", () => {
  it("renders login button", () => {
    render(<Login />);

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });

    expect(button).toBeInTheDocument();
  });

  it("calls Google sign-in when button is clicked", async () => {
    render(<Login />);

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });

    fireEvent.click(button);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });
});