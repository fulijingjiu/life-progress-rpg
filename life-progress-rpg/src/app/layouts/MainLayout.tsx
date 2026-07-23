import { ReactNode } from 'react';
import { TopBar } from '@/shared/ui/TopBar';
import { Container } from '@/shared/ui/Container';

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-shell">
      <TopBar />
      <Container>{children}</Container>
    </div>
  );
}
