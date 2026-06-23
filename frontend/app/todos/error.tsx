'use client'

export default function Error({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>문제가 발생했어요</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  )
}
