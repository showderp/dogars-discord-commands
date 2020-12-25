export type DogarsPage = [number, [DogarsSet]];

export interface DogarsSet {
  id: number;
  description?: string;
  date_added: number;
  format: string;
  creator?: string;
  hash?: string;
  has_custom?: number;
  species: string;
  name?: string;
  gender?: string;
  item?: string;
  ability?: string;
  shiny?: boolean;
  level?: number;
  happiness?: number;
  nature?: string;
  move_1?: string;
  move_2?: string;
  move_3?: string;
  move_4?: string;
  hp_ev?: number;
  atk_ev?: number;
  def_ev?: number;
  spa_ev?: number;
  spd_ev?: number;
  spe_ev?: number;
  hp_iv?: number;
  atk_iv?: number;
  def_iv?: number;
  spa_iv?: number;
  spd_iv?: number;
  spe_iv?: number;
}

export type DogarsQuery =
  'date_added'| 'format' | 'creator' | 'hash' |
  'name' | 'species' | 'gender' | 'item' | 'ability' |
  'shiny' | 'level' | 'happiness' | 'nature' | 'move_1' |
  'move_2' | 'move_3' | 'move_4' | 'description' | 'random';
