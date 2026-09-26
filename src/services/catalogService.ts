import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DEMO_COUNTRIES, DEMO_JOBS, DEMO_PROFESSIONS } from '../lib/demoData';
import { Country, Job, Profession } from '../types';

export async function fetchCountries(): Promise<Country[]> {
  if (!isSupabaseConfigured) return DEMO_COUNTRIES;
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('active', true)
    .order('featured', { ascending: false });
  if (error) {
    console.error('fetchCountries error', error);
    return DEMO_COUNTRIES;
  }
  return data as Country[];
}

export async function fetchProfessions(): Promise<Profession[]> {
  if (!isSupabaseConfigured) return DEMO_PROFESSIONS;
  const { data, error } = await supabase.from('professions').select('*').eq('active', true);
  if (error) {
    console.error('fetchProfessions error', error);
    return DEMO_PROFESSIONS;
  }
  return data as Profession[];
}

export interface JobFilters {
  countryId?: string;
  professionId?: string;
  query?: string;
}

export async function fetchJobs(filters: JobFilters = {}): Promise<Job[]> {
  if (!isSupabaseConfigured) {
    return DEMO_JOBS.filter((j) => {
      if (filters.countryId && j.country.id !== filters.countryId) return false;
      if (filters.professionId && j.profession_id !== filters.professionId) return false;
      if (filters.query) {
        const q = filters.query.trim();
        if (q && !`${j.title} ${j.company_name} ${j.country.name} ${j.city}`.includes(q)) return false;
      }
      return true;
    });
  }
  let q = supabase
    .from('jobs')
    .select('*, country:countries(id, name, flag_url), company:companies(name, logo_url)')
    .eq('status', 'published');
  if (filters.countryId) q = q.eq('country_id', filters.countryId);
  if (filters.professionId) q = q.eq('profession_id', filters.professionId);
  const { data, error } = await q;
  if (error) {
    console.error('fetchJobs error', error);
    return [];
  }
  return data as unknown as Job[];
}

export async function fetchJobById(id: string): Promise<Job | undefined> {
  if (!isSupabaseConfigured) return DEMO_JOBS.find((j) => j.id === id);
  const { data, error } = await supabase
    .from('jobs')
    .select('*, country:countries(id, name, flag_url), company:companies(name, logo_url)')
    .eq('id', id)
    .single();
  if (error) {
    console.error('fetchJobById error', error);
    return undefined;
  }
  return data as unknown as Job;
          }
