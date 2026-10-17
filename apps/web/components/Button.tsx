// apps/web/components/Button.tsx
//
// The three kinds of button (design system section 9.1):
//   - main:   the ONE most important action on a screen (has a stitch line)
//   - second: other actions such as Cancel or Open (the default)
//   - danger: saying no or removing something
// `small` makes a 36 px button for use inside tables. A button that cannot be
// used yet is faded and does nothing (the `disabled` setting).
// Owned by Mithi.

import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: 'main' | 'second' | 'danger';
  small?: boolean;
};

export function Button({
  kind = 'second',
  small = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    kind === 'second' ? '' : `btn-${kind}`,
    small ? 'btn-small' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <button type={type} className={classes} {...rest} />;
}
