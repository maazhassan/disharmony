import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { useAppData } from './App';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('./App', () => ({
  useAppData: jest.fn(),
}));

describe('Login Component', () => {
  const mockUseAppData = useAppData as jest.MockedFunction<typeof useAppData>;

  beforeEach(() => {
    // Reset mock function calls and implementations before each test
    jest.resetAllMocks();
  });

  it('renders Login component correctly', () => {
    mockUseAppData.mockReturnValue({ handleClickLogin: jest.fn(), connectionStatus: 'Open' });

    const { getByText, getByPlaceholderText } = render(<Login />);

    expect(getByText('Login')).toBeInTheDocument();
    expect(getByPlaceholderText('Username...')).toBeInTheDocument();
    expect(getByPlaceholderText('Password...')).toBeInTheDocument();
    expect(getByText('Login')).toBeInTheDocument();
    expect(getByText("Don't have an account?")).toBeInTheDocument();
    expect(getByText('Click here!')).toBeInTheDocument();
  });

  it('calls handleClickLogin when login button is clicked', async () => {
    const mockHandleClickLogin = jest.fn();
    mockUseAppData.mockReturnValue({ handleClickLogin: mockHandleClickLogin, connectionStatus: 'Open' });

    const { getByPlaceholderText, getByText } = render(<Login />);

    const usernameInput = getByPlaceholderText('Username...');
    const passwordInput = getByPlaceholderText('Password...');
    const loginButton = getByText('Login');

    // Fill in the inputs
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    // Click the login button
    fireEvent.click(loginButton);

    // Ensure that handleClickLogin is called with the correct arguments
    await waitFor(() => expect(mockHandleClickLogin).toHaveBeenCalledWith('testuser', 'testpassword'));
  });

  it('disables login button when connectionStatus is not "Open" or username is empty', () => {
    mockUseAppData.mockReturnValue({ handleClickLogin: jest.fn(), connectionStatus: 'Connecting' });

    const { getByText } = render(<Login />);

    const loginButton = getByText('Login');

    expect(loginButton).toBeDisabled();
  });
});

// npm install --save-dev @testing-library/react @testing-library/jest-dom

