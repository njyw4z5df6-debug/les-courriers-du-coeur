-- Applied to production Supabase via the connected admin interface on 2026-11-08.
-- Keep published courriers and replies available only to signed-in members;
-- authenticated administrators retain their existing dedicated policies.
drop policy if exists lecture_courriers_valides on public.courriers;
create policy lecture_courriers_valides on public.courriers
  for select to authenticated
  using (valide = true and statut = 'valide');
drop policy if exists lire_reponses_valides on public.reponses;
create policy lire_reponses_valides on public.reponses
  for select to authenticated
  using (statut = 'valide');
revoke select on public.courriers from anon;
revoke select on public.reponses from anon;
