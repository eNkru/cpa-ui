import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfigModal, { validateHost, validatePort } from './ConfigModal';

// Mock the tauri invoke
vi.mock('../lib/tauri', () => ({
  saveConfig: vi.fn().mockResolvedValue(undefined),
}));

describe('validateHost', () => {
  it('accepts valid hostnames', () => {
    expect(validateHost('localhost')).toBeNull();
    expect(validateHost('192.168.1.1')).toBeNull();
    expect(validateHost('example.com')).toBeNull();
  });

  it('rejects empty host', () => {
    expect(validateHost('')).not.toBeNull();
    expect(validateHost('   ')).not.toBeNull();
  });
});

describe('validatePort', () => {
  it('accepts valid ports', () => {
    expect(validatePort(1)).toBeNull();
    expect(validatePort(8317)).toBeNull();
    expect(validatePort(65535)).toBeNull();
  });

  it('rejects port 0', () => {
    expect(validatePort(0)).not.toBeNull();
  });

  it('rejects non-integer ports', () => {
    expect(validatePort(1.5)).not.toBeNull();
  });
});

describe('ConfigModal', () => {
  const defaultProps = {
    currentHost: 'localhost',
    currentPort: 8317,
    onSave: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with current host and port pre-filled', () => {
    render(<ConfigModal {...defaultProps} />);
    const hostInput = screen.getByRole('textbox', { name: /host/i });
    const portInput = screen.getByRole('spinbutton', { name: /port/i });
    expect(hostInput).toHaveValue('localhost');
    expect(portInput).toHaveValue(8317);
  });

  it('shows validation error for empty host', async () => {
    render(<ConfigModal {...defaultProps} />);
    const hostInput = screen.getByRole('textbox', { name: /host/i });
    fireEvent.change(hostInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows validation error for invalid port', async () => {
    render(<ConfigModal {...defaultProps} />);
    const portInput = screen.getByRole('spinbutton', { name: /port/i });
    fireEvent.change(portInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('calls onSave with valid host and port', async () => {
    render(<ConfigModal {...defaultProps} />);
    const hostInput = screen.getByRole('textbox', { name: /host/i });
    const portInput = screen.getByRole('spinbutton', { name: /port/i });
    fireEvent.change(hostInput, { target: { value: '192.168.1.100' } });
    fireEvent.change(portInput, { target: { value: '9000' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(defaultProps.onSave).toHaveBeenCalledWith('192.168.1.100', 9000));
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ConfigModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
