-- Phase 4: manual-edit protection
-- Tracks which company fields the user has hand-edited so that a future
-- "Research company" run does not silently overwrite their correction.

alter table companies
  add column manually_edited_fields text[] default '{}';
