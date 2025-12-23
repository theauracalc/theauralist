// src/components/NewsBanner.jsx
export default function NewsBanner() {
  return (
    <div className="mb-6 rounded-2xl glass-dark border border-purple-500/40 p-4 sm:p-5 text-sm sm:text-base text-white/80">
      <div className="font-extrabold text-lg sm:text-xl mb-2 text-white">
        📰 Aura List v2 – New Look, New Mechanics
      </div>
      <p className="mb-2">
        The Aura List has been upgraded with a darker UI, smarter voting, and clearer rankings.
      </p>
      <ul className="list-disc list-inside space-y-1 mb-2">
        <li>
          <span className="font-semibold">New interface:</span> Dark, clean, mobile‑friendly layout with search to quickly find anyone on the list.
        </li>
        <li>
          <span className="font-semibold">Weighted voting:</span> Votes are worth between 2 and 5 aura points depending on how far someone is from their base aura, so the top is harder to rig.
        </li>
        <li>
          <span className="font-semibold">Rising / Falling tabs:</span> Rising shows people above their base aura, Falling shows people below it, ordered by how big the change is.
        </li>
      </ul>
      <p className="text-xs text-white/50">
        You can vote UP or DOWN once per person every 24 hours. After you vote, you&apos;ll see how many points your vote was worth, and the board updates live.
      </p>
    </div>
  )
}
