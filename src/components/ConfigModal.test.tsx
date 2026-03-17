import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfigModal, { validateUrl } from './ConfigModal';

// Mock the tauri invoke
vi.mock('../lib/tauri', () => ({
  saveConfig: vi.fn().mockResolvedValue(undefined),
}));

describe('validateUrl', () => {
  it('accepts http:// URLs', () => {
    expect(validateUrl('http://localhost:8317/')).toBeNull();
  });

  it('accepts https:// URLs', () => {
    expect(validateUrl('https://example.com')).toBeNull();
  });

  it('rejects non-http URLs', () => {
    expect(validateUrl('ftp://example.com')).not.toBeNull();
    expect(validateUrl('not-a-url')).not.toBeNull();
    expect(validateUrl('')).not.toBeNull();
  });
});

describe('ConfigModal', () => {
  const defaultProps = {
    currentUrl: 'http://localhost:8317/management.html#/',
    onSave: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with currentUrl pre-filled', () => {
    render(<ConfigModal {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: /management url/i });
    expect(input).toHaveValue('http://localhost:8317/management.html#/');
  });

  it('shows validation error for non-HTTP URL', async () => {
    render(<ConfigModal {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: /management url/i });
    fireEvent.change(input, { target: { value: 'not-a-url' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('calls onSave with valid URL', async () => {
    render(<ConfigModal {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: /management url/i });
    fireEvent.change(input, { target: { value: 'http://localhost:9000/' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(defaultProps.onSave).toHaveBeenCalledWith('http://localhost:9000/'));
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ConfigModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
