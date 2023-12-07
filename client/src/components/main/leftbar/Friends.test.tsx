import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Friends from "./Friends";

const mockUsers = [
  { username: "Alice", online: true },
  { username: "Bob", online: false },
  // Add more mock users as needed
];

const mockFriends = new Set(["Alice", "Bob"]);
const mockSelected = "Alice";

// Mock functions for testing
const mockOnSelect = jest.fn();
const mockOnUnselect = jest.fn();
const mockOnRemoveFriend = jest.fn();

const setup = () => {
  return render(
    <Friends
      friends={mockFriends}
      users={mockUsers}
      selected={mockSelected}
      onSelect={mockOnSelect}
      onUnselect={mockOnUnselect}
      onRemoveFriend={mockOnRemoveFriend}
    />
  );
};

describe("Friends Component", () => {
  it("renders user cards correctly", () => {
    const { getByText } = setup();

    // Ensure that user cards for Alice and Bob are rendered
    expect(getByText("Alice")).toBeInTheDocument();
    expect(getByText("Bob")).toBeInTheDocument();
  });

  it("calls onSelect and onUnselect correctly on click", () => {
    const { getByText } = setup();

    // Click on Alice (selected)
    fireEvent.click(getByText("Alice"));
    expect(mockOnUnselect).toHaveBeenCalled();

    // Click on Bob (unselected)
    fireEvent.click(getByText("Bob"));
    expect(mockOnSelect).toHaveBeenCalledWith("Bob");
  });

  it("calls onRemoveFriend correctly on context menu item click", () => {
    const { getByText, getByTestId } = setup();

    // Right-click on Alice and trigger the context menu
    fireEvent.contextMenu(getByText("Alice"));

    // Click on the "Remove Friend" context menu item
    fireEvent.click(getByTestId("context-menu-item"));

    // Ensure that onRemoveFriend is called with the correct friend name
    expect(mockOnRemoveFriend).toHaveBeenCalledWith("Alice");
  });
});

// npm install --save-dev @testing-library/react @testing-library/jest-dom
