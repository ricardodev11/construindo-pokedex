import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PokemonDetail,
  PokemonEvolution,
  PokemonListResponse,
  PokemonSpecies,
  PokemonTypeDetail,
  PokemonTypeDetailFull,
} from '../../models/pokemon-api.models';

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/';

  constructor(private readonly http: HttpClient) {}

  getPokemonList(limit: number, offset: number): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}pokemon`, {
      params: { limit, offset },
    });
  }

  getPokemonByIdOrName(
    idOrName: string | number,
  ): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(
      `${this.baseUrl}pokemon/${idOrName}`,
    );
  }

  getTypes(): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}type`);
  }

  getPokemonByType(typeName: string): Observable<PokemonTypeDetail> {
    return this.http.get<PokemonTypeDetail>(
      `${this.baseUrl}type/${typeName}`,
    );
  }

  getPokemonSpecies(idOrName: string | number): Observable<PokemonSpecies> {
    return this.http.get<PokemonSpecies>(
      `${this.baseUrl}pokemon-species/${idOrName}`,
    );
  }

  getTypeDamageRelations(typeName: string): Observable<PokemonTypeDetailFull> {
    return this.http.get<PokemonTypeDetailFull>(
      `${this.baseUrl}type/${typeName}`,
    );
  }

  getEvolutionChain(id: number): Observable<PokemonEvolution> {
    return this.http.get<PokemonEvolution>(
      `${this.baseUrl}evolution-chain/${id}`,
    );
  }
}