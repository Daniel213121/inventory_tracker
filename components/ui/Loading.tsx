export function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--secondary)',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}
