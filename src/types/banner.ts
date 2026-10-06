export interface Banner {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  link_url: string | null;
  sort_order: number;
  active: boolean;
}
