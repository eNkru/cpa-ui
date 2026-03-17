import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from './Toolbar';

describe('Toolbar', () => {
  it('renders Reload and Settings buttons', () => {
    render(<Toolbar onReload={vi.fn()} onSettings={vi.fn()} />);
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('calls onReload when Reload is clicked', () => {
    const onReload = vi.fn();
    render(<Toolbar onReload={onReload} onSettings={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /reload/i }));
    expect(onReload).toHaveBeenCalledOnce();
  });

  it('calls onSettings when Settings is clicked', () => {
    const onSettings = vi.fn();
    render(<Toolbar onReload={vi.fn()} onSettings={onSettings} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(onSettings).toHaveBeenCalledOnce();
  });
});
