import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TagList, Tag } from './TagList';

describe('TagList', () => {
  it('renders tags and allows adding/removing', () => {
    const tags: Tag[] = [
      { id: 1, label: 'React' },
      { id: 2, label: 'Next.js' },
    ];
    const onAdd = jest.fn();
    const onRemove = jest.fn();
    render(<TagList tags={tags} onAdd={onAdd} onRemove={onRemove} />);

    // Tags rendered
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();

    // Add tag
    const input = screen.getByPlaceholderText('Add a tag...');
    fireEvent.change(input, { target: { value: 'TypeScript' } });
    fireEvent.submit(input.closest('form')!);
    expect(onAdd).toHaveBeenCalledWith('TypeScript');

    // Remove tag
    const removeButtons = screen.getAllByTitle('Remove tag');
    fireEvent.click(removeButtons[0]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
