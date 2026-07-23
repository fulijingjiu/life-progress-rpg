import { ReactNode } from 'react';

type SectionTitleProps = {
  title: string;
  description?: ReactNode;
};

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <header className="section-title">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
