// Discovery is dynamic: a new dated proposals.json needs no registry update.
export async function discoverMoodleReviews(fetcher = fetch) {
  const response = await fetcher('api/moodle-reviews', {cache:'no-store'});
  if (!response.ok) throw new Error('No se pudieron consultar las revisiones de Moovi. Inicia la web con npm run dev.');
  const index = await response.json();
  if (!Array.isArray(index.reviews) || index.reviews.some(item =>
    !/^imports\/moodle\/\d{4}-\d{2}-\d{2}\/proposals\.json$/.test(item.path) ||
    !/^[a-f0-9]{64}$/.test(item.sha256))) throw new Error('Índice de revisiones inválido.');
  return index.reviews.sort((a,b)=>a.path.localeCompare(b.path));
}

export async function readMoodleReview(path, fetcher = fetch) {
  const response = await fetcher(path, {cache:'no-store'});
  if (!response.ok) throw new Error('No se pudo cargar '+path+'.');
  const text = await response.text();
  if (new TextEncoder().encode(text).length > 5*1024*1024) throw new Error('La revisión supera los 5 MB.');
  return JSON.parse(text);
}

export function resolvedReviewIds(state, file) {
  const entries=Object.entries(file.references||{});
  if (!entries.length) return null;
  const resolved=entries.every(([,id])=>{
    const proposal=(state.aiProposals||[]).find(item=>item.id===id || item.previousVersions?.some(version=>version.id===id));
    return proposal && ['accepted','discarded'].includes(proposal.status);
  });
  return resolved ? entries.map(([id])=>id) : null;
}

export async function deleteMoodleReview(path, file, resolvedIds, fetcher = fetch) {
  const response=await fetcher('api/moodle-reviews/cleanup',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({path,sha256:file.sha256,resolved_ids:resolvedIds})
  });
  const result=await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(result.error||'No se pudieron borrar los JSON. Reinicia el servidor con npm run dev.');
  if (!Array.isArray(result.deleted)) throw new Error('Respuesta de limpieza inválida.');
  return result.deleted;
}
