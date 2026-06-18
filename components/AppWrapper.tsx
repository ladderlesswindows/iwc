interface Props {
  children: React.ReactNode;
}

export function AppWrapper({ children }: Props) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      {children}
    </div>
  );
}
