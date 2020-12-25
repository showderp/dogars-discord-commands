import axios from 'axios';
import { DogarsPage, DogarsQuery, DogarsSet } from './types';

export const getSet = async (id: number): Promise<DogarsSet | undefined> => {
  try {
    return (await axios.get<DogarsSet>(`https://dogars.ga/api/sets/${id}`)).data;
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

export const getRandomSetId = async () => {
  try {
    return (await axios.get<number>('https://dogars.ga/api/random')).data;
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

export const searchSets = async (
  query: string,
  isRandom: boolean = false,
): Promise<DogarsPage | undefined> => {
  try {
    const params: any = { q: query, page: 1 };

    if (isRandom) {
      params.random = 'true';
    }

    return (await axios.get<DogarsPage>(
      'https://dogars.ga/api/search',
      { params },
    )).data;
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

export const advancedSearchSets = async (
  queries: Partial<{ [key in DogarsQuery]: string }>,
  isRandom: boolean = false,
): Promise<DogarsPage | undefined> => {
  try {
    const params = { ...queries };

    if (isRandom) {
      params.random = 'true';
    }

    return (await axios.get<DogarsPage>('https://dogars.ga/api/search', { params })).data;
  } catch (error) {
    console.error(error);

    return undefined;
  }
};
