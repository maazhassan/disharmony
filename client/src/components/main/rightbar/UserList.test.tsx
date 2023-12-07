import React from "react";
import { render, fireEvent } from "@testing-library/react";
import UserList from "./UserList";

const mockUsers = [
  { username: "Alice", online: true, user_type: "USER" },
  { username: "Bob", online: false, user_type: "USER" },
  { username: "Admin", online: true, user_type: "ADMIN" },
];

const mockSelectedUsers = new Set(["Alice"]);
const mockUserType = "ADMIN";
const mockUsername = "Admin";
const mockFriends = ["Alice"];
const mockBlocked = [];
const mockSelectedFriend = "";

// Mock functions for testing
const mockOnKick = jest.fn();
const mockOnBan = jest.fn();
const mockOnFriendReq = jest.fn();
const mockOnBlock = jest.fn();

const setup = () => {
  return render(
    <UserList
      selectedUsers={mockSelectedUsers}
      users={mockUsers}
      userType={mockUserType}
      username={mockUsername}
      friends={mockFriends}
      blocked={mockBlocked}
      selectedFriend={mockSelectedFriend}
      onKick={mockOnKick}
      onBan={mockOnBan}
      onFriendReq={mockOnFriendReq}
      onBlock={mockOnBlock}
    />
  );
};

describe("UserList Component", () => {
  it("renders user cards correctly", () => {
    const { getByText } = setup();

    // Ensure that user cards for Alice and Bob are rendered
    expect(getByText("Alice")).toBeInTheDocument();
    expect(getByText("Bob")).toBeInTheDocument();
  });

  it("displays the context menu on right-click", () => {
    const { getByText, getByTestId } = setup();

    // Right-click on Alice and trigger the context menu
    fireEvent.contextMenu(getByText("Alice"));

    // Check if the context menu items are displayed
    expect(getByTestId("context-menu-item-kick")).toBeInTheDocument();
    expect(getByTestId("context-menu-item-ban")).toBeInTheDocument();
    expect(getByTestId("context-menu-item-block")).toBeInTheDocument();
    expect(getByTestId("context-menu-item-friend-request")).toBeInTheDocument();
  });

  it("calls onKick, onBan, onBlock, and onFriendReq correctly on context menu item click", () => {
    const { getByTestId } = setup();

    // Right-click on Alice and trigger the context menu
    fireEvent.contextMenu(getByText("Alice"));

    // Click on the context menu items
    fireEvent.click(getByTestId("context-menu-item-kick"));
    expect(mockOnKick).toHaveBeenCalledWith("Alice");

    fireEvent.click(getByTestId("context-menu-item-ban"));
    expect(mockOnBan).toHaveBeenCalledWith("Alice");

    fireEvent.click(getByTestId("context-menu-item-block"));
    expect(mockOnBlock).toHaveBeenCalledWith("Alice");

    fireEvent.click(getByTestId("context-menu-item-friend-request"));
    expect(mockOnFriendReq).toHaveBeenCalledWith("Alice");
  });
});

// npm install --save-dev @testing-library/react @testing-library/jest-dom

